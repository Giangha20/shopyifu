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

    // Check SKU collision if SKU changed
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuConflict = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (skuConflict) {
        return NextResponse.json(
          { error: `Mã SKU "${data.sku}" đã được sử dụng bởi sản phẩm khác` },
          { status: 409 }
        );
      }
    }

    const toDecimal = (val: any) => {
      if (val === undefined || val === null || val === '') return null;
      const num = Number(val);
      if (isNaN(num)) return null;
      return new Prisma.Decimal(num);
    };

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(body.categoryIds)) {
        await tx.productCategory.deleteMany({
          where: { productId: id },
        });

        if (body.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: body.categoryIds.map((cid: string) => ({
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
          const usedSkus = new Set<string>();
          const variantData = body.variants.map((v: any, idx: number) => {
            let varSku = (v.sku || '').trim() || `${data.sku || existingProduct.sku}-${idx + 1}`;
            if (usedSkus.has(varSku)) {
              varSku = `${varSku}-${idx + 1}-${Date.now().toString(36).slice(-3)}`;
            }
            usedSkus.add(varSku);

            return {
              productId: id,
              name: v.name || `Phiên bản ${idx + 1}`,
              sku: varSku,
              price: toDecimal(v.price),
              quantity: typeof v.quantity === 'number' ? Math.max(0, v.quantity) : Number(v.quantity) || 0,
              color: v.color || null,
              size: v.size || null,
              image: v.image || null,
              sortOrder: idx,
              isActive: v.isActive !== undefined ? Boolean(v.isActive) : true,
            };
          });

          await tx.productVariant.createMany({
            data: variantData,
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
          price: data.price !== undefined ? (toDecimal(data.price) ?? new Prisma.Decimal(0)) : undefined,
          compareAtPrice: data.compareAtPrice !== undefined ? toDecimal(data.compareAtPrice) : undefined,
          costPrice: data.costPrice !== undefined ? toDecimal(data.costPrice) : undefined,
          quantity: data.quantity,
          lowStockThreshold: data.lowStockThreshold ?? undefined,
          weight: data.weight !== undefined ? toDecimal(data.weight) : undefined,
          brand: data.brand,
          tags: data.tags,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isNew: data.isNew,
          isBestseller: data.isBestseller,
          metaTitle: data.metaTitle,
          isRentable:
            body.isRentable !== undefined
              ? Boolean(body.isRentable === true || body.isRentable === 'true')
              : data.isRentable !== undefined
              ? data.isRentable
              : undefined,
          rentalPricePerDay: data.rentalPricePerDay !== undefined ? toDecimal(data.rentalPricePerDay) : undefined,
          rentalDepositFee: data.rentalDepositFee !== undefined ? toDecimal(data.rentalDepositFee) : undefined,
          rentalTerms: data.rentalTerms !== undefined ? data.rentalTerms : undefined,
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
      {
        error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi cập nhật sản phẩm',
        details: error instanceof Error ? error.message : String(error),
      },
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

