import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, verifyPassword, hashPassword, logAudit } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Tài khoản không hỗ trợ đổi mật khẩu trực tiếp' },
        { status: 400 }
      );
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Mật khẩu hiện tại không chính xác' },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
      },
    });

    await logAudit(user.id, 'change_password', 'user', user.id, undefined, request);

    return NextResponse.json({
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi đổi mật khẩu' },
      { status: 500 }
    );
  }
}
