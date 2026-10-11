import { prisma } from './db';
import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
);

const SESSION_COOKIE = 'luxe-session';
const ADMIN_SESSION_COOKIE = 'luxe-admin-session';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '86400');
const ADMIN_SESSION_MAX_AGE = parseInt(process.env.ADMIN_SESSION_MAX_AGE || '28800');
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// ========================================
// PASSWORD HASHING
// ========================================

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// ========================================
// JWT TOKEN MANAGEMENT
// ========================================

interface TokenPayload {
  userId: string;
  email: string;
  type: 'customer' | 'admin';
  roles?: string[];
}

export async function createToken(payload: TokenPayload, maxAge: number = SESSION_MAX_AGE): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ========================================
// SESSION MANAGEMENT
// ========================================

export async function createSession(userId: string, isAdmin: boolean = false) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) throw new Error('User not found');

  const roles = user.userRoles.map((ur) => ur.role.name);
  const maxAge = isAdmin ? ADMIN_SESSION_MAX_AGE : SESSION_MAX_AGE;

  const token = await createToken(
    {
      userId: user.id,
      email: user.email,
      type: isAdmin ? 'admin' : 'customer',
      roles,
    },
    maxAge
  );

  const cookieStore = await cookies();
  const cookieName = isAdmin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE;

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  // Update last login
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      loginAttempts: 0,
      lockedUntil: null,
    },
  });

  return { token, user };
}

export async function getSession(isAdmin: boolean = false): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const cookieName = isAdmin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE;
  const token = cookieStore.get(cookieName)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // For admin sessions, verify the user still has admin role
  if (isAdmin && payload.type !== 'admin') return null;

  return payload;
}

export async function destroySession(isAdmin: boolean = false) {
  const cookieStore = await cookies();
  const cookieName = isAdmin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE;
  cookieStore.delete(cookieName);
}

// ========================================
// AUTHENTICATION
// ========================================

export async function authenticateUser(email: string, password: string) {
  const identifier = email.trim().toLowerCase();
  const rawIdentifier = email.trim();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: rawIdentifier },
      ],
    },
  });

  if (!user) {
    return { success: false, error: 'Email/Số điện thoại hoặc mật khẩu không đúng' };
  }

  if (!user.isActive) {
    return { success: false, error: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.' };
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
    );
    return {
      success: false,
      error: `Tài khoản tạm khóa. Vui lòng thử lại sau ${minutesLeft} phút.`,
    };
  }

  if (!user.passwordHash) {
    return { success: false, error: 'Tài khoản này sử dụng đăng nhập qua dịch vụ khác' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    // Increment login attempts
    const attempts = user.loginAttempts + 1;
    const updateData: Record<string, unknown> = { loginAttempts: attempts };

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(
        Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const remaining = MAX_LOGIN_ATTEMPTS - attempts;
    if (remaining > 0) {
      return {
        success: false,
        error: `Email hoặc mật khẩu không đúng. Còn ${remaining} lần thử.`,
      };
    }
    return {
      success: false,
      error: `Tài khoản đã bị khóa ${LOCK_DURATION_MINUTES} phút do nhập sai quá nhiều lần.`,
    };
  }

  return { success: true, user };
}

// ========================================
// AUTHORIZATION HELPERS
// ========================================

export async function requireAuth(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireAdmin(): Promise<TokenPayload> {
  const session = await getSession(true);
  if (!session || session.type !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return session;
}

export async function requirePermission(permissionName: string): Promise<TokenPayload> {
  const session = await requireAdmin();

  // Super Admin has all permissions
  if (session.roles?.includes('super_admin')) return session;

  const hasPermission = await prisma.rolePermission.findFirst({
    where: {
      role: {
        name: { in: session.roles || [] },
      },
      permission: {
        name: permissionName,
      },
    },
  });

  if (!hasPermission) {
    throw new Error('FORBIDDEN');
  }

  return session;
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để tiếp tục' },
        { status: 401 }
      );
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: 'Bạn không có quyền thực hiện thao tác này' },
        { status: 403 }
      );
    }
  }
  return NextResponse.json(
    { error: 'Đã có lỗi xảy ra' },
    { status: 500 }
  );
}

// ========================================
// MIDDLEWARE HELPERS
// ========================================

export async function withAuth(
  request: NextRequest,
  handler: (session: TokenPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    return handler(session);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function withAdmin(
  request: NextRequest,
  handler: (session: TokenPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session || session.type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return handler(session);
  } catch (error) {
    return handleAuthError(error);
  }
}

// ========================================
// AUDIT LOGGING
// ========================================

export async function logAudit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  changes?: Record<string, unknown>,
  request?: NextRequest
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined,
        ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
        userAgent: request?.headers.get('user-agent') || undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
