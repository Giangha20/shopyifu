import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const isRead = typeof body.isRead === 'boolean' ? body.isRead : true;

    const notif = await prisma.notification.findFirst({
      where: { id, userId: session.userId },
    });

    if (!notif) {
      return NextResponse.json({ error: 'Thông báo không tồn tại' }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Không thể cập nhật thông báo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { id } = params;

    const notif = await prisma.notification.findFirst({
      where: { id, userId: session.userId },
    });

    if (!notif) {
      return NextResponse.json({ error: 'Thông báo không tồn tại' }, { status: 404 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa thông báo' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({ error: 'Không thể xóa thông báo' }, { status: 500 });
  }
}
