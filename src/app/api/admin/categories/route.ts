import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    return NextResponse.json({ categories, data: categories });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin list categories error:', error);
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
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    let slug = slugify(data.name);

    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) {
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
      include: {
        parent: true,
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
    console.error('Admin create category error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tạo danh mục' },
      { status: 500 }
    );
  }
}
