import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { categorySchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin get category error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh mục' },
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

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Không tìm thấy danh mục' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = categorySchema.partial().safeParse(body);

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

    if (data.parentId && data.parentId === id) {
      return NextResponse.json(
        { error: 'Danh mục cha không thể là chính nó' },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
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

    await logAudit(session.userId, 'update', 'category', id, { name: updated.name }, request);

    return NextResponse.json({
      message: 'Cập nhật danh mục thành công',
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin update category error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật danh mục' },
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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
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
        { error: 'Không thể xóa danh mục đang có danh mục con' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({
        where: { categoryId: id },
      });
      await tx.category.delete({
        where: { id },
      });
    });

    await logAudit(session.userId, 'delete', 'category', id, { name: category.name }, request);

    return NextResponse.json({
      message: 'Đã xóa danh mục thành công',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin delete category error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa danh mục' },
      { status: 500 }
    );
  }
}
