import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const markReadSchema = z.object({
  id: z.string().optional(),
  markAll: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15')));
    const skip = (page - 1) * limit;

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({
        where: { userId: session.userId },
      }),
      prisma.notification.count({
        where: { userId: session.userId, isRead: false },
      }),
      prisma.notification.findMany({
        where: { userId: session.userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('List notifications error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách thông báo' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validation = markReadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id, markAll } = validation.data;
    const now = new Date();

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true, readAt: now },
      });

      return NextResponse.json({
        message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      });
    }

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.userId },
        data: { isRead: true, readAt: now },
      });

      return NextResponse.json({
        message: 'Đã đánh dấu thông báo là đã đọc',
      });
    }

    return NextResponse.json(
      { error: 'Vui lòng cung cấp id thông báo hoặc tham số markAll' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật thông báo' },
      { status: 500 }
    );
  }
}
