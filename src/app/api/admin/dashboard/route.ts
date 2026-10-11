import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === '1y') days = 365;

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Core Metrics queries in parallel
    const [
      totalOrders,
      periodOrders,
      prevPeriodOrders,
      totalCustomers,
      periodCustomers,
      prevPeriodCustomers,
      totalProducts,
      totalRevenueResult,
      periodRevenueResult,
      prevPeriodRevenueResult,
      recentOrdersRaw,
      lowStockProductsRaw,
      orderStatusCounts,
      topProductsRaw,
      chartOrdersRaw,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),
      // Period orders
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Prev period orders
      prisma.order.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
      }),
      // Total customers
      prisma.user.count(),
      // Period customers
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Prev period customers
      prisma.user.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
      }),
      // Total active products
      prisma.product.count({
        where: { isActive: true },
      }),
      // Total revenue (all non-cancelled, non-returned)
      prisma.order.aggregate({
        where: {
          status: { notIn: ['cancelled', 'returned'] },
        },
        _sum: { totalAmount: true },
      }),
      // Period revenue
      prisma.order.aggregate({
        where: {
          status: { notIn: ['cancelled', 'returned'] },
          createdAt: { gte: startDate },
        },
        _sum: { totalAmount: true },
      }),
      // Prev period revenue
      prisma.order.aggregate({
        where: {
          status: { notIn: ['cancelled', 'returned'] },
          createdAt: { gte: previousStartDate, lt: startDate },
        },
        _sum: { totalAmount: true },
      }),
      // Recent 10 orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      // Low stock products
      prisma.product.findMany({
        where: {
          isActive: true,
          quantity: { lte: 5 },
        },
        take: 5,
        orderBy: { quantity: 'asc' },
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          price: true,
        },
      }),
      // Status breakdown
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      // Top 5 selling products
      prisma.product.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: [{ soldCount: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          name: true,
          price: true,
          soldCount: true,
          images: {
            take: 1,
            orderBy: { isPrimary: 'desc' },
            select: { url: true },
          },
        },
      }),
      // Orders list for charts
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ['cancelled', 'returned'] },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);
    const periodRevenue = Number(periodRevenueResult._sum.totalAmount || 0);
    const prevPeriodRevenue = Number(prevPeriodRevenueResult._sum.totalAmount || 0);

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 15.0 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const revenueTrend = calculateTrend(periodRevenue, prevPeriodRevenue);
    const ordersTrend = calculateTrend(periodOrders, prevPeriodOrders);
    const customersTrend = calculateTrend(periodCustomers, prevPeriodCustomers);

    // Format orders by status
    const statusMap: Record<string, number> = {};
    orderStatusCounts.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    const ordersByStatus = orderStatusCounts.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));

    // Format top products
    const topProducts = topProductsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      soldCount: p.soldCount || 0,
      image: p.images[0]?.url || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&q=80',
    }));

    // Format recent orders with full customer info
    const recentOrders = recentOrdersRaw.map((o) => {
      const userName = o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() : '';
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: userName || o.shippingName || 'Khách vãng lai',
        customerEmail: o.user?.email || o.shippingEmail || 'Chưa cung cấp',
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt,
      };
    });

    // Format low stock products
    const lowStockProducts = lowStockProductsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      price: Number(p.price),
    }));

    // Generate continuous chart data
    const chartMap: Record<string, { revenue: number; orders: number }> = {};
    const chartSteps = Math.min(days, 30);
    const stepInterval = (days * 24 * 60 * 60 * 1000) / chartSteps;

    for (let i = 0; i <= chartSteps; i++) {
      const d = new Date(startDate.getTime() + i * stepInterval);
      const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      chartMap[label] = { revenue: 0, orders: 0 };
    }

    // Populate chartMap from orders
    chartOrdersRaw.forEach((order) => {
      const d = new Date(order.createdAt);
      const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (chartMap[label]) {
        chartMap[label].revenue += Number(order.totalAmount);
        chartMap[label].orders += 1;
      } else {
        chartMap[label] = {
          revenue: Number(order.totalAmount),
          orders: 1,
        };
      }
    });

    const chartData = Object.keys(chartMap).map((date) => ({
      date,
      revenue: chartMap[date].revenue,
      orders: chartMap[date].orders,
    }));

    return NextResponse.json({
      metrics: {
        revenue: totalRevenue,
        totalRevenue: totalRevenue,
        periodRevenue,
        revenueTrend,
        orders: totalOrders,
        totalOrders: totalOrders,
        periodOrders,
        ordersTrend,
        customers: totalCustomers,
        totalCustomers: totalCustomers,
        customersTrend,
        products: totalProducts,
        totalProducts: totalProducts,
      },
      chartData,
      ordersByStatus,
      statusBreakdown: statusMap,
      topProducts,
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy thống kê bảng điều khiển' },
      { status: 500 }
    );
  }
}
