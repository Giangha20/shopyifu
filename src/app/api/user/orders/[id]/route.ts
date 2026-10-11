import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;

    // Can query by ID or orderNumber
    const order = await prisma.order.findFirst({
      where: {
        userId: session.userId,
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
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
        items: order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
        payments: order.payments.map((p) => ({
          ...p,
          amount: Number(p.amount),
        })),
      },
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    return NextResponse.json({ error: 'Không thể tải chi tiết đơn hàng' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, reason } = body;

    const order = await prisma.order.findFirst({
      where: {
        userId: session.userId,
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    if (action === 'cancel') {
      if (order.status !== 'pending' && order.status !== 'confirmed') {
        return NextResponse.json(
          { error: 'Không thể hủy đơn hàng khi đơn đã vào quy trình đóng gói hoặc đang vận chuyển.' },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const o = await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'cancelled',
            cancelReason: reason || 'Khách hàng hủy đơn',
            cancelledAt: new Date(),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: 'cancelled',
            note: reason || 'Khách hàng yêu cầu hủy đơn',
            changedBy: 'customer',
          },
        });

        await tx.notification.create({
          data: {
            userId: session.userId,
            type: 'order_status',
            title: `Đơn hàng #${order.orderNumber} đã hủy`,
            message: `Bạn đã hủy thành công đơn hàng #${order.orderNumber}.`,
            link: `/tai-khoan/don-hang/${order.orderNumber}`,
          },
        });

        return o;
      });

      return NextResponse.json({ success: true, order: updated, message: 'Đã hủy đơn hàng thành công' });
    }

    if (action === 'return_request') {
      if (order.status !== 'delivered') {
        return NextResponse.json(
          { error: 'Chỉ có thể yêu cầu đổi/trả cho các đơn hàng đã được giao thành công.' },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const o = await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'return_requested',
            customerNote: reason ? `[Yêu cầu đổi/trả]: ${reason}` : order.customerNote,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: 'return_requested',
            note: reason || 'Khách hàng yêu cầu đổi/trả hàng',
            changedBy: 'customer',
          },
        });

        await tx.notification.create({
          data: {
            userId: session.userId,
            type: 'order_status',
            title: `Yêu cầu đổi/trả đơn hàng #${order.orderNumber}`,
            message: `Hệ thống đã ghi nhận yêu cầu đổi/trả của bạn. Đội ngũ chăm sóc khách hàng sẽ liên hệ trong 24 giờ.`,
            link: `/tai-khoan/don-hang/${order.orderNumber}`,
          },
        });

        return o;
      });

      return NextResponse.json({
        success: true,
        order: updated,
        message: 'Đã gửi yêu cầu đổi/trả thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error) {
    console.error('Order action error:', error);
    return NextResponse.json({ error: 'Xử lý yêu cầu thất bại' }, { status: 500 });
  }
}
