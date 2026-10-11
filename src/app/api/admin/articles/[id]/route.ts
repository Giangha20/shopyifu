import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const article = await prisma.article.findUnique({ where: { id: params.id } });
    if (!article) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const existing = await prisma.article.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: body.title ?? existing.title,
        excerpt: body.excerpt ?? existing.excerpt,
        content: body.content ?? existing.content,
        featuredImage: body.featuredImage !== undefined ? body.featuredImage : existing.featuredImage,
        categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
        status: body.status ?? existing.status,
        metaTitle: body.metaTitle ?? existing.metaTitle,
        metaDescription: body.metaDescription ?? existing.metaDescription,
      },
    });

    await logAudit(session.userId, 'update', 'article', params.id, { title: updated.title }, request);

    return NextResponse.json({ message: 'Cập nhật thành công', article: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    await prisma.article.delete({ where: { id: params.id } });
    await logAudit(session.userId, 'delete', 'article', params.id, undefined, request);
    return NextResponse.json({ message: 'Xóa thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa' }, { status: 500 });
  }
}
