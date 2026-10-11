import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy banner' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { title, subtitle, image, link, buttonText, position, sortOrder, isActive } = body;

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        image,
        link,
        buttonText,
        position: position || 'hero',
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    await logAudit(session.userId, 'create', 'banner', banner.id, { title }, request);
    return NextResponse.json({ message: 'Tạo banner thành công', banner }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo banner' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { id, title, subtitle, image, link, buttonText, position, sortOrder, isActive } = body;

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        image,
        link,
        buttonText,
        position,
        sortOrder,
        isActive,
      },
    });

    await logAudit(session.userId, 'update', 'banner', id, { title }, request);
    return NextResponse.json({ message: 'Cập nhật banner thành công', banner: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật banner' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

    await prisma.banner.delete({ where: { id } });
    await logAudit(session.userId, 'delete', 'banner', id, undefined, request);
    return NextResponse.json({ message: 'Xóa banner thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa' }, { status: 500 });
  }
}
