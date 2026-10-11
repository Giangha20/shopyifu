import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const q = (searchParams.get('q') || searchParams.get('search'))?.trim();
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'newest';

    const where: Prisma.ProductWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categories = {
        some: { categoryId },
      };
    }

    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'low_stock') where.quantity = { lte: 5 };
    if (status === 'out_of_stock') where.quantity = 0;

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'quantity_asc') orderBy = { quantity: 'asc' };
    if (sort === 'quantity_desc') orderBy = { quantity: 'desc' };
    if (sort === 'sold_desc') orderBy = { soldCount: 'desc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          categories: {
            include: { category: true },
          },
          variants: true,
          _count: {
            select: { reviews: true, orderItems: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      products,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin list products error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách sản phẩm' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu sản phẩm không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    let slug = slugify(data.name);

    let slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (skuExists) {
      return NextResponse.json(
        { error: 'Mã SKU đã tồn tại' },
        { status: 409 }
      );
    }

    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug,
          sku: data.sku,
          shortDescription: data.shortDescription,
          description: data.description,
          price: new Prisma.Decimal(data.price),
          compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
          costPrice: data.costPrice ? new Prisma.Decimal(data.costPrice) : null,
          quantity: data.quantity,
          lowStockThreshold: data.lowStockThreshold ?? 5,
          weight: data.weight ? new Prisma.Decimal(data.weight) : null,
          brand: data.brand,
          tags: data.tags ?? [],
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
          isNew: data.isNew ?? true,
          metaTitle: data.metaTitle || data.name,
          metaDescription: data.metaDescription,
        },
      });

      if (data.categoryIds && data.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: data.categoryIds.map((cid: string) => ({
            productId: product.id,
            categoryId: cid,
          })),
        });
      }

      if (Array.isArray(body.images) && body.images.length > 0) {
        await tx.productImage.createMany({
          data: body.images
            .map((img: any, idx: number) => {
              const url = typeof img === 'string' ? img : img?.url || '';
              const alt = typeof img === 'string' ? data.name : img?.alt || data.name;
              const isPrimary = typeof img === 'string' ? idx === 0 : img?.isPrimary ?? idx === 0;
              return {
                productId: product.id,
                url,
                alt,
                sortOrder: idx,
                isPrimary,
              };
            })
            .filter((img: any) => Boolean(img.url)),
        });
      }

      if (Array.isArray(body.variants) && body.variants.length > 0) {
        await tx.productVariant.createMany({
          data: body.variants.map((v: { name: string; sku: string; price?: number; quantity: number; color?: string; size?: string; image?: string }, idx: number) => ({
            productId: product.id,
            name: v.name,
            sku: v.sku,
            price: v.price ? new Prisma.Decimal(v.price) : null,
            quantity: v.quantity,
            color: v.color || null,
            size: v.size || null,
            image: v.image || null,
            sortOrder: idx,
            isActive: true,
          })),
        });
      }

      return product;
    });

    await logAudit(session.userId, 'create', 'product', createdProduct.id, { name: createdProduct.name }, request);

    const fullProduct = await prisma.product.findUnique({
      where: { id: createdProduct.id },
      include: {
        images: true,
        categories: { include: { category: true } },
        variants: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Tạo sản phẩm mới thành công',
        data: fullProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin create product error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tạo sản phẩm' },
      { status: 500 }
    );
  }
}
