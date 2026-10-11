import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const adminSession = await getSession(true);

    if (!session && !adminSession) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xem thông tin đơn hàng' },
        { status: 401 }
      );
    }

    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Check ownership unless admin
    const isAdmin = adminSession?.type === 'admin' || session?.type === 'admin';
    if (!isAdmin && order.userId !== session?.userId) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xem thông tin đơn hàng này' },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Get order detail error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy chi tiết đơn hàng' },
      { status: 500 }
    );
  }
}
