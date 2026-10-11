import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
);

const SESSION_COOKIE = 'luxe-session';
const ADMIN_SESSION_COOKIE = 'luxe-admin-session';

// In-memory rate limiting map for middleware edge execution
const ipRequests = new Map<string, { count: number; resetTime: number }>();

function applyRateLimit(ip: string, limit: number = 120, windowMs: number = 60000) {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now > record.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}

// Clean up stale rate limit entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    ipRequests.forEach((val, key) => {
      if (now > val.resetTime) {
        ipRequests.delete(key);
      }
    });
  }, 60000);
}

async function verifyEdgeToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. Handle CORS Preflight for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 2. Rate limiting check (Exclude static and next internals)
  const maxLimit = pathname.startsWith('/api/upload') ? 1000 : 600;
  const rateLimitResult = applyRateLimit(ip, maxLimit, 60000);
  if (!rateLimitResult.success && pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': maxLimit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  }

  // 3. Admin Routes Protection: /admin/*
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
      if (adminToken) {
        const payload = await verifyEdgeToken(adminToken);
        if (payload && payload.type === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
    } else {
      if (!adminToken) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const payload = await verifyEdgeToken(adminToken);
      if (!payload || payload.type !== 'admin') {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete(ADMIN_SESSION_COOKIE);
        return response;
      }
    }
  }

  // 4. Customer Account Protection: /tai-khoan/*
  if (pathname.startsWith('/tai-khoan')) {
    const userToken = request.cookies.get(SESSION_COOKIE)?.value;

    if (!userToken) {
      const loginUrl = new URL('/dang-nhap', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyEdgeToken(userToken);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/dang-nhap', request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  // 5. Auth Pages (Login/Register) redirect to /tai-khoan if already authenticated
  if (pathname === '/dang-nhap' || pathname === '/dang-ky') {
    const userToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (userToken) {
      const payload = await verifyEdgeToken(userToken);
      if (payload) {
        return NextResponse.redirect(new URL('/tai-khoan', request.url));
      }
    }
  }

  // 6. Build response with security headers
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );

  // Rate limit response headers
  response.headers.set('X-RateLimit-Limit', '120');
  response.headers.set('X-RateLimit-Remaining', Math.max(0, rateLimitResult.remaining).toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

  // CORS headers for API routes
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder)
     * - uploads/ (uploaded media files)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|uploads).*)',
  ],
};
