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
        firstName: s.firstName,
        lastName: s.lastName,
        name: `${s.lastName || ''} ${s.firstName || ''}`.trim() || s.email,
        email: s.email,
        phone: s.phone || '',
        roles: s.userRoles.map((ur) => ur.role.displayName || ur.role.name),
        roleIds: s.userRoles.map((ur) => ur.roleId),
        roleNames: s.userRoles.map((ur) => ur.role.name),
        isActive: s.isActive,
        lastLoginAt: s.lastLoginAt,
        createdAt: s.createdAt,
      })),
      roles,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Chỉ quản trị viên mới có quyền xem nhân sự' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Lỗi lấy nhân sự' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { email, password, firstName, lastName, phone, roleId } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'Vui lòng điền đủ họ tên, email và mật khẩu' }, { status: 400 });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: emailTrimmed } });
    if (existing) {
      return NextResponse.json({ error: 'Email này đã tồn tại' }, { status: 400 });
    }

    const phoneTrimmed = phone ? phone.trim() : null;
    if (phoneTrimmed) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: phoneTrimmed } });
      if (existingPhone) {
        return NextResponse.json({ error: 'Số điện thoại này đã có người sử dụng' }, { status: 400 });
      }
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: emailTrimmed,
        passwordHash: hashedPassword,
        firstName: firstName.trim(),
        lastName: (lastName || '').trim(),
        phone: phoneTrimmed,
        isActive: true,
        userRoles: roleId
          ? {
              create: [{ roleId }],
            }
          : undefined,
      },
    });

    await logAudit(session.userId, 'create_staff', 'user', newUser.id, { email: emailTrimmed, roleId }, request);

    return NextResponse.json({ message: 'Tạo tài khoản quản trị/nhân viên thành công', user: newUser }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Chỉ quản trị viên mới có quyền tạo nhân viên' }, { status: 403 });
    }
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'Lỗi tạo nhân viên' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { id, firstName, lastName, email, phone, password, isActive, roleId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID nhân viên' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản nhân viên' }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {};

    if (firstName !== undefined) updatePayload.firstName = firstName.trim();
    if (lastName !== undefined) updatePayload.lastName = lastName.trim();

    if (email && email.trim().toLowerCase() !== targetUser.email) {
      const emailTrimmed = email.trim().toLowerCase();
      const existingEmail = await prisma.user.findUnique({ where: { email: emailTrimmed } });
      if (existingEmail && existingEmail.id !== id) {
        return NextResponse.json({ error: 'Email đã được sử dụng bởi tài khoản khác' }, { status: 400 });
      }
      updatePayload.email = emailTrimmed;
    }

    if (phone !== undefined && phone !== targetUser.phone) {
      const phoneTrimmed = phone ? phone.trim() : null;
      if (phoneTrimmed) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: phoneTrimmed, id: { not: id } },
        });
        if (existingPhone) {
          return NextResponse.json({ error: 'Số điện thoại đã có người sử dụng' }, { status: 400 });
        }
      }
      updatePayload.phone = phoneTrimmed;
    }

    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json({ error: 'Mật khẩu mới tối thiểu 6 ký tự' }, { status: 400 });
      }
      updatePayload.passwordHash = await hashPassword(password.trim());
    }

    if (isActive !== undefined) {
      updatePayload.isActive = Boolean(isActive);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data: updatePayload,
      });

      if (roleId) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.create({
          data: { userId: id, roleId },
        });
      }

      return u;
    });

    await logAudit(session.userId, 'update_staff', 'user', id, { updatedFields: Object.keys(updatePayload), roleId }, request);

    return NextResponse.json({ message: 'Cập nhật tài khoản quản trị/nhân viên thành công', user: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Chỉ quản trị viên mới có quyền cập nhật thông tin này' }, { status: 403 });
    }
    console.error('Update staff error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật nhân viên' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID nhân viên' }, { status: 400 });
    }

    if (id === session.userId) {
      return NextResponse.json({ error: 'Không thể tự xóa tài khoản của chính mình' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    await logAudit(session.userId, 'delete_staff', 'user', id, {}, request);

    return NextResponse.json({ message: 'Đã xóa tài khoản nhân viên' });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Chỉ quản trị viên mới có quyền xóa tài khoản này' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Lỗi khi xóa nhân viên' }, { status: 500 });
  }
}
