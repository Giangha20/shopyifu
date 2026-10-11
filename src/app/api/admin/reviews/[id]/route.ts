import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const updateReviewStatusSchema = z.object({
  isApproved: z.boolean().optional(),
  isHidden: z.boolean().optional(),
});

async function recalculateProductRating(productId: string) {
  const aggregations = await prisma.review.aggregate({
    where: {
      productId,
      isApproved: true,
      isHidden: false,
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: new Prisma.Decimal(aggregations._avg.rating ? aggregations._avg.rating.toFixed(2) : '0'),
      reviewCount: aggregations._count.rating,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateReviewStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.review.update({
      where: { id },
      data: {
        isApproved: data.isApproved !== undefined ? data.isApproved : undefined,
        isHidden: data.isHidden !== undefined ? data.isHidden : undefined,
      },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    await recalculateProductRating(review.productId);

    await logAudit(
      session.userId,
      'update_review_status',
      'review',
      id,
      { isApproved: updated.isApproved, isHidden: updated.isHidden },
      request
    );

    return NextResponse.json({
      message: 'Cập nhật trạng thái đánh giá thành công',
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin update review error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật đánh giá' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.reviewImage.deleteMany({
        where: { reviewId: id },
      });
      await tx.review.delete({
        where: { id },
      });
    });

    await recalculateProductRating(review.productId);

    await logAudit(session.userId, 'delete', 'review', id, { productId: review.productId }, request);

    return NextResponse.json({
      message: 'Đã xóa đánh giá thành công',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin delete review error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa đánh giá' },
      { status: 500 }
    );
  }
}
