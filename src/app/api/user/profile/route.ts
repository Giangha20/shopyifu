import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, logAudit } from '@/lib/auth';
import { profileSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        isEmailVerified: true,
        newsletterSubscribed: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            wishlistItems: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin tài khoản' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy thông tin hồ sơ' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone } = validation.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone || null,
        avatar: body.avatar !== undefined ? body.avatar : undefined,
        newsletterSubscribed:
          body.newsletterSubscribed !== undefined ? Boolean(body.newsletterSubscribed) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        newsletterSubscribed: true,
      },
    });

    await logAudit(session.userId, 'update', 'user_profile', session.userId, undefined, request);

    return NextResponse.json({
      message: 'Cập nhật thông tin thành công',
      data: updatedUser,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật hồ sơ' },
      { status: 500 }
    );
  }
}
