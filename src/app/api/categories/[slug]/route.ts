import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, image: true },
        },
      },
    });

    if (!category || !category.isActive) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    const [totalProducts, products] = await Promise.all([
      prisma.productCategory.count({
        where: {
          categoryId: category.id,
          product: { isActive: true },
        },
      }),
      prisma.productCategory.findMany({
        where: {
          categoryId: category.id,
          product: { isActive: true },
        },
        skip,
        take: limit,
        orderBy: { product: { createdAt: 'desc' } },
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' } },
              variants: { where: { isActive: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: {
        category,
        products: products.map((p) => p.product),
      },
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh mục' },
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

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục cần cập nhật' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = categorySchema.partial().safeParse(body);

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

    // Check circular parent relation
    if (data.parentId && data.parentId === existingCategory.id) {
      return NextResponse.json(
        { error: 'Danh mục cha không thể là chính danh mục này' },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: existingCategory.id },
      data: {
        name: data.name,
        description: data.description,
        image: body.image !== undefined ? body.image : undefined,
        parentId: data.parentId !== undefined ? data.parentId : undefined,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
    });

    await logAudit(
      session.userId,
      'update',
      'category',
      existingCategory.id,
      { previous: existingCategory.name, updated: updated.name },
      request
    );

    return NextResponse.json({
      message: 'Cập nhật danh mục thành công',
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật danh mục' },
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

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    if (category.children.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa danh mục đang có danh mục con. Vui lòng chuyển hoặc xóa danh mục con trước.' },
        { status: 400 }
      );
    }

    if (category._count.products > 0) {
      // Safe option: de-activate or unlink products
      await prisma.productCategory.deleteMany({
        where: { categoryId: category.id },
      });
    }

    await prisma.category.delete({
      where: { id: category.id },
    });

    await logAudit(
      session.userId,
      'delete',
      'category',
      category.id,
      { name: category.name },
      request
    );

    return NextResponse.json({
      message: 'Đã xóa danh mục thành công',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa danh mục' },
      { status: 500 }
    );
  }
}
