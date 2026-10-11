import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const wishlistActionSchema = z.object({
  productId: z.string().min(1, 'Mã sản phẩm không hợp lệ'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            categories: {
              include: { category: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: wishlist.map((item) => ({
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: item.product,
      })),
      total: wishlist.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để xem danh sách yêu thích' }, { status: 401 });
    }
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách yêu thích' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validation = wishlistActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { productId } = validation.data;

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh' },
        { status: 404 }
      );
    }

    // Upsert or create
    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
      update: {},
      create: {
        userId: session.userId,
        productId,
      },
    });

    return NextResponse.json(
      {
        message: 'Đã thêm sản phẩm vào danh sách yêu thích',
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để thêm vào yêu thích' }, { status: 401 });
    }
    console.error('Add wishlist error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật danh sách yêu thích' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const id = searchParams.get('id');

    if (!productId && !id) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp productId hoặc id để xóa' },
        { status: 400 }
      );
    }

    if (productId) {
      await prisma.wishlistItem.deleteMany({
        where: {
          userId: session.userId,
          productId,
        },
      });
    } else if (id) {
      await prisma.wishlistItem.deleteMany({
        where: {
          userId: session.userId,
          id,
        },
      });
    }

    return NextResponse.json({
      message: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để thực hiện' }, { status: 401 });
    }
    console.error('Delete wishlist error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa khỏi yêu thích' },
      { status: 500 }
    );
  }
}
