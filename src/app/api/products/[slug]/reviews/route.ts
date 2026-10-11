import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { reviewSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;
    const rating = searchParams.get('rating');

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    const where: Prisma.ReviewWhereInput = {
      productId: product.id,
      isApproved: true,
      isHidden: false,
      ...(rating ? { rating: parseInt(rating) } : {}),
    };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List reviews error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách đánh giá' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await requireAuth();
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = reviewSchema.safeParse({
      ...body,
      productId: product.id,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu đánh giá không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { rating, title, content } = validation.data;

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId: session.userId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Bạn đã đánh giá sản phẩm này trước đó' },
        { status: 400 }
      );
    }

    // Check if user has purchased this product (completed/delivered order)
    const verifiedOrder = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: session.userId,
          status: 'delivered',
        },
      },
    });

    const isVerified = Boolean(verifiedOrder);

    const newReview = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          productId: product.id,
          userId: session.userId,
          rating,
          title,
          content,
          isVerified,
          isApproved: true,
        },
      });

      if (Array.isArray(body.images) && body.images.length > 0) {
        await tx.reviewImage.createMany({
          data: body.images.map((imgUrl: string, idx: number) => ({
            reviewId: review.id,
            url: imgUrl,
            sortOrder: idx,
          })),
        });
      }

      // Recalculate average rating & review count for the product
      const aggregations = await tx.review.aggregate({
        where: {
          productId: product.id,
          isApproved: true,
          isHidden: false,
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          avgRating: new Prisma.Decimal((aggregations._avg.rating || rating).toFixed(2)),
          reviewCount: aggregations._count.rating,
        },
      });

      return review;
    });

    return NextResponse.json(
      {
        message: 'Đánh giá sản phẩm đã được gửi thành công',
        data: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để đánh giá' }, { status: 401 });
    }
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tạo đánh giá' },
      { status: 500 }
    );
  }
}
