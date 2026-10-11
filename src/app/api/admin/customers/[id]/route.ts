import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

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
        name: `${user.lastName} ${user.firstName}`.trim(),
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

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : user.isActive,
      },
    });

    await logAudit(
      session.userId,
      'toggle_user_status',
      'user',
      params.id,
      { isActive: updated.isActive },
      request
    );

    return NextResponse.json({ message: 'Cập nhật thành công', customer: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
