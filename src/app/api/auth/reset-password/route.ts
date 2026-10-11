import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/validations';
import { hashPassword, logAudit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Verify token
    const record = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'password_reset',
        expires: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: record.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản người dùng' },
        { status: 404 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Update password and clear lockouts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: record.identifier,
        type: 'password_reset',
      },
    });

    await logAudit(user.id, 'reset_password', 'user', user.id, undefined, request);

    return NextResponse.json({
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra trong quá trình đặt lại mật khẩu' },
      { status: 500 }
    );
  }
}
