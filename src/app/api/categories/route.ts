import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get('flat') === 'true';

    // Retrieve categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (flat) {
      return NextResponse.json({ data: categories });
    }

    // Build hierarchical tree structure
    type CategoryItem = (typeof categories)[0] & { children?: CategoryItem[] };
    const categoryMap = new Map<string, CategoryItem>();
    const tree: CategoryItem[] = [];

    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const item = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children!.push(item);
      } else {
        tree.push(item);
      }
    });

    return NextResponse.json({ data: tree });
  } catch (error) {
    console.error('List categories error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh mục' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu danh mục không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    let slug = slugify(data.name);

    let slugExists = await prisma.category.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: body.image || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        metaTitle: data.metaTitle || data.name,
        metaDescription: data.metaDescription,
      },
    });

    await logAudit(session.userId, 'create', 'category', category.id, { name: category.name }, request);

    return NextResponse.json(
      {
        message: 'Tạo danh mục thành công',
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tạo danh mục' },
      { status: 500 }
    );
  }
}
