import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    // Fetch users with roles assigned
    const staffUsers = await prisma.user.findMany({
      where: {
        userRoles: { some: {} },
      },
      include: {
        userRoles: { include: { role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const roles = await prisma.role.findMany();

    return NextResponse.json({
      staff: staffUsers.map((s) => ({
        id: s.id,
        name: `${s.lastName} ${s.firstName}`.trim(),
        email: s.email,
        phone: s.phone || '—',
        roles: s.userRoles.map((ur) => ur.role.displayName || ur.role.name),
        roleNames: s.userRoles.map((ur) => ur.role.name),
        isActive: s.isActive,
        lastLoginAt: s.lastLoginAt,
        createdAt: s.createdAt,
      })),
      roles,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy nhân sự' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { email, password, firstName, lastName, phone, roleId } = body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        isActive: true,
        userRoles: roleId
          ? {
              create: [{ roleId }],
            }
          : undefined,
      },
    });

    await logAudit(session.userId, 'create_staff', 'user', newUser.id, { email, roleId }, request);

    return NextResponse.json({ message: 'Tạo tài khoản nhân viên thành công', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'Lỗi tạo nhân viên' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { id, isActive, roleId } = body;

    if (isActive !== undefined) {
      await prisma.user.update({
        where: { id },
        data: { isActive },
      });
    }

    if (roleId) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.create({
        data: { userId: id, roleId },
      });
    }

    await logAudit(session.userId, 'update_staff', 'user', id, { isActive, roleId }, request);

    return NextResponse.json({ message: 'Cập nhật nhân sự thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
  }
}
