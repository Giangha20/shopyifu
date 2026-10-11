import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { productSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const color = searchParams.get('color');
    const size = searchParams.get('size');
    const q = searchParams.get('q')?.trim();
    const sort = searchParams.get('sort') || 'newest';
    const isFeatured = searchParams.get('isFeatured');
    const isBestseller = searchParams.get('isBestseller');
    const isNew = searchParams.get('isNew');

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      const targetCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: category },
            { id: category },
            { slug: { equals: category, mode: 'insensitive' } },
            { name: { equals: category, mode: 'insensitive' } },
          ],
        },
        include: { children: true },
      });

      if (targetCategory) {
        const categoryIds = [targetCategory.id, ...(targetCategory.children?.map((c) => c.id) || [])];
        const categorySlugs = [targetCategory.slug, ...(targetCategory.children?.map((c) => c.slug) || [])];
        where.categories = {
          some: {
            category: {
              OR: [
                { id: { in: categoryIds } },
                { slug: { in: categorySlugs } },
                { parentId: targetCategory.id },
              ],
            },
          },
        };
      } else {
        where.categories = {
          some: {
            category: {
              OR: [
                { slug: { equals: category, mode: 'insensitive' } },
                { id: category },
                { name: { contains: category, mode: 'insensitive' } },
              ],
            },
          },
        };
      }
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = new Prisma.Decimal(minPrice);
      if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice);
    }

    if (rating) {
      where.avgRating = { gte: new Prisma.Decimal(rating) };
    }

    if (isFeatured === 'true') where.isFeatured = true;
    if (isBestseller === 'true') where.isBestseller = true;
    if (isNew === 'true') where.isNew = true;

    if (color || size) {
      where.variants = {
        some: {
          isActive: true,
          ...(color ? { color: { equals: color, mode: 'insensitive' } } : {}),
          ...(size ? { size: { equals: size, mode: 'insensitive' } } : {}),
        },
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
      case 'bestselling':
        orderBy = { soldCount: 'desc' };
        break;
      case 'rating':
        orderBy = { avgRating: 'desc' };
        break;
      case 'views':
        orderBy = { viewCount: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

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
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              quantity: true,
              color: true,
              size: true,
              image: true,
            },
          },
        },
      }),
    ]);

    const sanitizedProducts = products.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      costPrice: p.costPrice ? Number(p.costPrice) : null,
      avgRating: Number(p.avgRating) || 5.0,
      reviewCount: Number(p.reviewCount) || 0,
      soldCount: Number(p.soldCount) || 0,
    }));

    return NextResponse.json({
      data: sanitizedProducts,
      products: sanitizedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List products error:', error);
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

    // Verify unique slug
    let slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Verify unique SKU
    const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (skuExists) {
      return NextResponse.json(
        { error: 'Mã SKU đã tồn tại trong hệ thống' },
        { status: 409 }
      );
    }

    const newProduct = await prisma.$transaction(async (tx) => {
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
          data: data.categoryIds.map((catId: string) => ({
            productId: product.id,
            categoryId: catId,
          })),
        });
      }

      if (Array.isArray(body.images) && body.images.length > 0) {
        await tx.productImage.createMany({
          data: body.images.map((img: { url: string; alt?: string; isPrimary?: boolean }, index: number) => ({
            productId: product.id,
            url: img.url,
            alt: img.alt || data.name,
            sortOrder: index,
            isPrimary: img.isPrimary ?? index === 0,
          })),
        });
      }

      return product;
    });

    await logAudit(session.userId, 'create', 'product', newProduct.id, { name: newProduct.name }, request);

    const fullProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: {
        images: true,
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(
      {
        message: 'Tạo sản phẩm thành công',
        data: fullProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tạo sản phẩm' },
      { status: 500 }
    );
  }
}
