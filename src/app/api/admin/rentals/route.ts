import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const q = (searchParams.get('q') || searchParams.get('search'))?.trim();

    const where: Prisma.RentalBookingWhereInput = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }

    if (q) {
      where.OR = [
        { bookingNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, bookings, statusCounts, totalRevenueAgg] = await Promise.all([
      prisma.rentalBooking.count({ where }),
      prisma.rentalBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: { images: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.rentalBooking.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.rentalBooking.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { rentalTotal: true, depositFee: true },
      }),
    ]);

    const counts: Record<string, number> = {};
    statusCounts.forEach((sc) => {
      counts[sc.status] = sc._count.status;
    });

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalBookings: total,
        pendingCount: counts['PENDING'] || 0,
        rentingCount: counts['RENTING'] || 0,
        returnedCount: counts['RETURNED'] || 0,
        completedCount: counts['COMPLETED'] || 0,
        cancelledCount: counts['CANCELLED'] || 0,
        totalRentalRevenue: totalRevenueAgg._sum.rentalTotal || 0,
        totalDepositHeld: totalRevenueAgg._sum.depositFee || 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin list rental bookings error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tải danh sách đơn thuê đồ' },
      { status: 500 }
    );
  }
}
