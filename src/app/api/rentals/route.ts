import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { rentalBookingSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest';
    const q = searchParams.get('q')?.trim();

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isRentable: true,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      where.categories = {
        some: {
          category: {
            OR: [
              { slug: { equals: category, mode: 'insensitive' } },
              { id: category },
            ],
          },
        },
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { rentalPricePerDay: 'asc' };
    if (sort === 'price_desc') orderBy = { rentalPricePerDay: 'desc' };
    if (sort === 'popular') orderBy = { soldCount: 'desc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          categories: { include: { category: true } },
          variants: { where: { isActive: true } },
        },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get rental products error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tải danh sách đồ cho thuê' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const validation = rentalBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu đặt thuê không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check product exists and is rentable
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { images: true },
    });

    if (!product || !product.isActive || !product.isRentable) {
      return NextResponse.json(
        { error: 'Sản phẩm không khả dụng để thuê' },
        { status: 400 }
      );
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Ngày thuê hoặc ngày trả không hợp lệ' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'Ngày trả đồ phải sau ngày nhận đồ' },
        { status: 400 }
      );
    }

    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const pricePerDay = product.rentalPricePerDay ?? product.price;
    const rentalTotal = new Prisma.Decimal(pricePerDay).mul(totalDays);
    const depositFee = product.rentalDepositFee ?? new Prisma.Decimal(0);
    const totalAmount = rentalTotal.add(depositFee);

    const bookingNumber = `RENT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking = await prisma.rentalBooking.create({
      data: {
        bookingNumber,
        userId: session?.userId || null,
        productId: product.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        shippingAddress: data.shippingAddress,
        idCardNumber: data.idCardNumber || null,
        startDate: start,
        endDate: end,
        totalDays,
        pricePerDay,
        rentalTotal,
        depositFee,
        totalAmount,
        refundedDeposit: new Prisma.Decimal(0),
        status: 'PENDING',
        paymentMethod: data.paymentMethod,
        paymentStatus: 'PENDING',
        sizeSelected: data.sizeSelected || null,
        customerNotes: data.customerNotes || null,
      },
      include: {
        product: {
          include: { images: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Đặt thuê trang phục thành công! Đội ngũ tư vấn sẽ liên hệ xác nhận ngay.',
      booking,
    });
  } catch (error) {
    console.error('Create rental booking error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tạo đơn thuê đồ' },
      { status: 500 }
    );
  }
}
