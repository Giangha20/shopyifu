import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: true } },
        variants: { orderBy: { sortOrder: 'asc' } },
        attributes: { orderBy: { sortOrder: 'asc' } },
        _count: {
          select: { reviews: true, orderItems: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: product, product });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin get product error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy thông tin sản phẩm' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = productSchema.partial().safeParse(body);

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

    const updated = await prisma.$transaction(async (tx) => {
      if (data.categoryIds) {
        await tx.productCategory.deleteMany({
          where: { productId: id },
        });

        if (data.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: data.categoryIds.map((cid: string) => ({
              productId: id,
              categoryId: cid,
            })),
          });
        }
      }

      if (Array.isArray(body.images)) {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        if (body.images.length > 0) {
          await tx.productImage.createMany({
            data: body.images
              .map((img: any, idx: number) => {
                const url = typeof img === 'string' ? img : img?.url || '';
                const alt = typeof img === 'string' ? (data.name || existingProduct.name) : (img?.alt || data.name || existingProduct.name);
                const isPrimary = typeof img === 'string' ? idx === 0 : (img?.isPrimary ?? idx === 0);
                return {
                  productId: id,
                  url,
                  alt,
                  sortOrder: idx,
                  isPrimary,
                };
              })
              .filter((img: any) => Boolean(img.url)),
          });
        }
      }

      if (Array.isArray(body.variants)) {
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        if (body.variants.length > 0) {
          await tx.productVariant.createMany({
            data: body.variants.map((v: any, idx: number) => ({
              productId: id,
              name: v.name || `Phiên bản ${idx + 1}`,
              sku: v.sku || `${existingProduct.sku}-${idx + 1}`,
              price: v.price ? new Prisma.Decimal(v.price) : null,
              quantity: typeof v.quantity === 'number' ? v.quantity : 1,
              color: v.color || null,
              size: v.size || null,
              image: v.image || null,
              sortOrder: idx,
              isActive: true,
            })),
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          sku: data.sku,
          shortDescription: data.shortDescription,
          description: data.description,
          price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
          compareAtPrice: data.compareAtPrice !== undefined ? (data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null) : undefined,
          costPrice: data.costPrice !== undefined ? (data.costPrice ? new Prisma.Decimal(data.costPrice) : null) : undefined,
          quantity: data.quantity,
          lowStockThreshold: data.lowStockThreshold,
          weight: data.weight !== undefined ? (data.weight ? new Prisma.Decimal(data.weight) : null) : undefined,
          brand: data.brand,
          tags: data.tags,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          isBestseller: data.isBestseller,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
        },
        include: {
          images: true,
          categories: { include: { category: true } },
          variants: true,
        },
      });
    });

    await logAudit(
      session.userId,
      'update',
      'product',
      id,
      { name: updated.name },
      request
    );

    return NextResponse.json({
      message: 'Cập nhật sản phẩm thành công',
      data: updated,
      product: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin update product error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật sản phẩm' },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: { select: { orderItems: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    // If product is associated with orders, soft-delete it to preserve historic order data
    if (product._count.orderItems > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      await logAudit(session.userId, 'archive', 'product', id, { name: product.name }, request);

      return NextResponse.json({
        message: 'Sản phẩm đã có đơn hàng nên được chuyển vào trạng thái lưu trữ/ẩn',
      });
    }

    // Safe to delete completely
    await prisma.product.delete({
      where: { id },
    });

    await logAudit(session.userId, 'delete', 'product', id, { name: product.name }, request);

    return NextResponse.json({
      message: 'Đã xóa sản phẩm thành công',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin delete product error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa sản phẩm' },
      { status: 500 }
    );
  }
}
