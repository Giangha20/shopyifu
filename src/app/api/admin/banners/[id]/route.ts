import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { bannerSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { error: 'Không tìm thấy banner' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = bannerSchema.partial().safeParse(body);

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

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: body.image !== undefined ? body.image : undefined,
        mobileImage: body.mobileImage !== undefined ? body.mobileImage : undefined,
        link: data.link,
        buttonText: data.buttonText,
        position: data.position,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
        endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
      },
    });

    await logAudit(session.userId, 'update', 'banner', id, { title: updated.title }, request);

    return NextResponse.json({
      message: 'Cập nhật banner thành công',
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin update banner error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        { error: 'Không tìm thấy banner' },
        { status: 404 }
      );
    }

    await prisma.banner.delete({
      where: { id },
    });

    await logAudit(session.userId, 'delete', 'banner', id, { title: banner.title }, request);

    return NextResponse.json({
      message: 'Đã xóa banner thành công',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin delete banner error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa banner' },
      { status: 500 }
    );
  }
}
