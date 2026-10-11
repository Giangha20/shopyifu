import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        content: r.content,
        isApproved: r.isApproved,
        isHidden: r.isHidden,
        createdAt: r.createdAt,
        productName: r.product.name,
        customerName: `${r.user.lastName} ${r.user.firstName}`.trim(),
        customerEmail: r.user.email,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy danh sách đánh giá' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { id, isApproved, isHidden } = body;

    const updated = await prisma.review.update({
      where: { id },
      data: {
        isApproved: isApproved !== undefined ? isApproved : undefined,
        isHidden: isHidden !== undefined ? isHidden : undefined,
      },
    });

    await logAudit(session.userId, 'moderate_review', 'review', id, { isApproved, isHidden }, request);

    return NextResponse.json({ message: 'Cập nhật thành công', review: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
  }
}
