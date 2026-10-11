import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit, hashPassword } from '@/lib/auth';
import { staffUpdateSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const staff = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...staff,
        roles: staff.userRoles.map((ur) => ur.role),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin get staff error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy thông tin nhân viên' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const existingStaff = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = staffUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.$transaction(async (tx) => {
      const updatePayload: Record<string, unknown> = {};
      if (data.firstName) updatePayload.firstName = data.firstName.trim();
      if (data.lastName) updatePayload.lastName = data.lastName.trim();
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
      if (data.password) {
        updatePayload.passwordHash = await hashPassword(data.password);
      }

      if (data.roleIds) {
        await tx.userRole.deleteMany({
          where: { userId: id },
        });

        if (data.roleIds.length > 0) {
          await tx.userRole.createMany({
            data: data.roleIds.map((rid: string) => ({
              userId: id,
              roleId: rid,
            })),
          });
        }
      }

      return tx.user.update({
        where: { id },
        data: updatePayload,
        include: {
          userRoles: { include: { role: true } },
        },
      });
    });

    await logAudit(session.userId, 'update_staff', 'user', id, { email: updated.email }, request);

    return NextResponse.json({
      message: 'Cập nhật nhân viên thành công',
      data: {
        ...updated,
        passwordHash: undefined,
        roles: updated.userRoles.map((ur) => ur.role),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin update staff error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật nhân viên' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    // Prevent deleting oneself
    if (session.userId === id) {
      return NextResponse.json(
        { error: 'Bạn không thể tự xóa tài khoản của chính mình' },
        { status: 400 }
      );
    }

    const staff = await prisma.user.findUnique({
      where: { id },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      );
    }

    // Remove staff roles and deactivate
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({
        where: { userId: id },
      });
      await tx.user.update({
        where: { id },
        data: { isActive: false },
      });
    });

    await logAudit(session.userId, 'delete_staff', 'user', id, { email: staff.email }, request);

    return NextResponse.json({
      message: 'Đã hủy quyền nhân viên và vô hiệu hóa tài khoản',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin delete staff error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa nhân viên' },
      { status: 500 }
    );
  }
}
