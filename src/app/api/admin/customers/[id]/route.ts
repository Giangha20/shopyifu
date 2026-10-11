import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit, hashPassword } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    const totalSpent = user.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + Number(o.totalAmount), 0);

    return NextResponse.json({
      customer: {
        id: user.id,
        name: `${user.lastName || ''} ${user.firstName || ''}`.trim() || user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        addresses: user.addresses,
        totalSpent,
        orders: user.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          totalAmount: Number(o.totalAmount),
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Chỉ quản trị viên mới có quyền truy cập' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    // Update names
    if (body.firstName !== undefined) updateData.firstName = body.firstName.trim();
    if (body.lastName !== undefined) updateData.lastName = body.lastName.trim();

    // Update email
    if (body.email && body.email.trim() !== user.email) {
      const emailTrimmed = body.email.trim().toLowerCase();
      const existingEmail = await prisma.user.findUnique({
        where: { email: emailTrimmed },
      });
      if (existingEmail && existingEmail.id !== user.id) {
        return NextResponse.json({ error: 'Email này đã có người sử dụng' }, { status: 400 });
      }
      updateData.email = emailTrimmed;
    }

    // Update phone
    if (body.phone !== undefined && body.phone !== user.phone) {
      const phoneTrimmed = body.phone ? body.phone.trim() : null;
      if (phoneTrimmed) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: phoneTrimmed, id: { not: user.id } },
        });
        if (existingPhone) {
          return NextResponse.json({ error: 'Số điện thoại này đã có người sử dụng' }, { status: 400 });
        }
      }
      updateData.phone = phoneTrimmed;
    }

    // Update password
    if (body.password && body.password.trim().length > 0) {
      if (body.password.trim().length < 6) {
        return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(body.password.trim());
    }

    // Update active status
    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    await logAudit(
      session.userId,
      'admin_update_customer',
      'user',
      params.id,
      { updatedFields: Object.keys(updateData) },
      request
    );

    return NextResponse.json({
      message: 'Cập nhật tài khoản khách hàng thành công',
      customer: {
        id: updated.id,
        name: `${updated.lastName || ''} ${updated.firstName || ''}`.trim() || updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Chỉ quản trị viên mới có quyền sửa tài khoản này' }, { status: 403 });
    }
    console.error('Update customer error:', error);
    return NextResponse.json({ error: 'Lỗi server khi cập nhật khách hàng' }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy khách hàng' }, { status: 404 });
    }

    // Check if user has orders
    const orderCount = await prisma.order.count({ where: { userId: params.id } });
    if (orderCount > 0) {
      // Deactivate rather than deleting to preserve financial history
      await prisma.user.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: 'Khách hàng có lịch sử đơn hàng đã được chuyển sang trạng thái Vô hiệu hóa',
      });
    }

    await prisma.user.delete({ where: { id: params.id } });

    await logAudit(
      session.userId,
      'admin_delete_customer',
      'user',
      params.id,
      { email: user.email },
      request
    );

    return NextResponse.json({ message: 'Xóa tài khoản khách hàng thành công' });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Chỉ quản trị viên mới có quyền xóa tài khoản' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Lỗi khi xóa khách hàng' }, { status: 500 });
  }
}
