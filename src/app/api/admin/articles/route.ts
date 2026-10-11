import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    await requireAdmin();
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy bài viết' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { title, excerpt, content, featuredImage, categoryId, status, metaTitle, metaDescription } = body;

    const baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        featuredImage,
        categoryId: categoryId || null,
        status: status || 'published',
        publishedAt: status === 'published' ? new Date() : null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
      },
    });

    await logAudit(session.userId, 'create', 'article', article.id, { title }, request);

    return NextResponse.json({ message: 'Tạo bài viết thành công', article }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo bài viết' }, { status: 500 });
  }
}
