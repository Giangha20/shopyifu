import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, sku: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        items: order.items.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
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

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const { status, paymentStatus, trackingNumber, internalNote, note } = body;

    const updated = await prisma.$transaction(async (tx) => {
      // Record history if status changed
      if (status && status !== existing.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: params.id,
            fromStatus: existing.status,
            toStatus: status,
            note: note || 'Quản trị viên cập nhật trạng thái',
            changedBy: session.email,
          },
        });
      }

      return tx.order.update({
        where: { id: params.id },
        data: {
          status: status ?? existing.status,
          paymentStatus: paymentStatus ?? existing.paymentStatus,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : existing.trackingNumber,
          internalNote: internalNote !== undefined ? internalNote : existing.internalNote,
        },
      });
    });

    await logAudit(
      session.userId,
      'update_order_status',
      'order',
      params.id,
      { oldStatus: existing.status, newStatus: status },
      request
    );

    return NextResponse.json({ message: 'Cập nhật đơn hàng thành công', order: updated });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật đơn hàng' }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId: params.id } }),
      prisma.orderStatusHistory.deleteMany({ where: { orderId: params.id } }),
      prisma.payment.deleteMany({ where: { orderId: params.id } }),
      prisma.order.delete({ where: { id: params.id } }),
    ]);

    await logAudit(
      session.userId,
      'delete_order',
      'order',
      params.id,
      { orderNumber: existing.orderNumber },
      request
    );

    return NextResponse.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa đơn hàng' }, { status: 500 });
  }
}
