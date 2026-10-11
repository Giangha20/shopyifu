import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, month

    const now = new Date();
    const startDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : now;

    // Fetch valid orders in range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { notIn: ['cancelled', 'returned'] },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        subtotal: true,
        discountAmount: true,
        shippingFee: true,
        paymentStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Top selling products in this range
    const topItems = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        order: {
          createdAt: { gte: startDate, lte: endDate },
          status: { notIn: ['cancelled', 'returned'] },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: 5,
    });

    // Grouping
    const groupedData: Record<string, { date: string; revenue: number; orderCount: number }> = {};

    orders.forEach((o) => {
      let key: string;
      const d = o.createdAt;
      if (groupBy === 'month') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = { date: key, revenue: 0, orderCount: 0 };
      }

      groupedData[key].revenue += Number(o.totalAmount);
      groupedData[key].orderCount += 1;
    });

    const timeline = Object.values(groupedData);

    const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        startDate,
        endDate,
      },
      timeline,
      topProducts: topItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        totalQuantity: item._sum.quantity || 0,
        totalRevenue: Number(item._sum.totalPrice || 0),
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin revenue report error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tạo báo cáo doanh thu' },
      { status: 500 }
    );
  }
}
