import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({
        products: [],
        categories: [],
        suggestions: [],
      });
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 8,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          brand: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: 'insensitive' },
        },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      }),
    ]);

    // Generate search suggestions
    const suggestionSet = new Set<string>();
    products.forEach((p) => {
      suggestionSet.add(p.name);
      if (p.brand) suggestionSet.add(p.brand);
    });
    categories.forEach((c) => {
      suggestionSet.add(c.name);
    });

    const suggestions = Array.from(suggestionSet).slice(0, 6);

    return NextResponse.json({
      query: q,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        brand: p.brand,
        image: p.images[0]?.url || null,
      })),
      categories,
      suggestions,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tìm kiếm' },
      { status: 500 }
    );
  }
}
