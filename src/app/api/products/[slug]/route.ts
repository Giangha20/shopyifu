import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const decoded = decodeURIComponent(slug);

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
          { slug: decoded },
          { id: decoded },
        ],
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
        attributes: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    // Increment viewCount asynchronously
    prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    // Rating breakdown summary
    const ratingSummary = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId: product.id,
        isApproved: true,
        isHidden: false,
      },
      _count: { rating: true },
    });

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingSummary.forEach((r) => {
      ratingDistribution[r.rating] = r._count.rating;
    });

    const resultPayload = {
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      avgRating: Number(product.avgRating) || 5.0,
      reviewCount: Number(product.reviewCount) || 0,
      soldCount: Number(product.soldCount) || 0,
      ratingDistribution,
    };

    return NextResponse.json({
      data: resultPayload,
      product: resultPayload,
    });
  } catch (error) {
    console.error('Get product detail error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tải sản phẩm' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await requireAdmin();
    const { slug } = params;

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      include: { categories: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm cần cập nhật' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = productSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu cập nhật không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.$transaction(async (tx) => {
      const updatePayload: Prisma.ProductUpdateInput = {
        name: data.name,
        sku: data.sku,
        shortDescription: data.shortDescription,
        description: data.description,
        price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
        compareAtPrice: data.compareAtPrice !== undefined ? (data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null) : undefined,
        costPrice: data.costPrice !== undefined ? (data.costPrice ? new Prisma.Decimal(data.costPrice) : null) : undefined,
        quantity: data.quantity,
        lowStockThreshold: data.lowStockThreshold ?? undefined,
        weight: data.weight !== undefined ? (data.weight ? new Prisma.Decimal(data.weight) : null) : undefined,
        brand: data.brand,
        tags: data.tags,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isNew: data.isNew,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      };

      if (data.categoryIds) {
        await tx.productCategory.deleteMany({
          where: { productId: existingProduct.id },
        });

        if (data.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: data.categoryIds.map((catId: string) => ({
              productId: existingProduct.id,
              categoryId: catId,
            })),
          });
        }
      }

      return tx.product.update({
        where: { id: existingProduct.id },
        data: updatePayload,
        include: {
          images: true,
          categories: { include: { category: true } },
          variants: true,
          attributes: true,
        },
      });
    });

    await logAudit(
      session.userId,
      'update',
      'product',
      existingProduct.id,
      { previous: existingProduct.name, updated: updated.name },
      request
    );

    return NextResponse.json({
      message: 'Cập nhật sản phẩm thành công',
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật sản phẩm' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await requireAdmin();
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id: product.id },
      data: { isActive: false },
    });

    await logAudit(
      session.userId,
      'soft_delete',
      'product',
      product.id,
      { name: product.name },
      request
    );

    return NextResponse.json({
      message: 'Đã chuyển sản phẩm vào trạng thái lưu trữ/ẩn',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa sản phẩm' },
      { status: 500 }
    );
  }
}
