import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validations';
import { logAudit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Email không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always respond with success to prevent user enumeration attacks
    if (!user || !user.isActive) {
      return NextResponse.json({
        message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến bạn.',
      });
    }

    // Generate secure reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        type: 'password_reset',
      },
    });

    // Store new token
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
        type: 'password_reset',
      },
    });

    await logAudit(
      user.id,
      'forgot_password_request',
      'user',
      user.id,
      { email: normalizedEmail },
      request
    );

    // In a production environment, send email here with reset link containing token
    return NextResponse.json({
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến bạn.',
      // In development mode, provide token for easy testing
      ...(process.env.NODE_ENV === 'development' && { resetToken: token }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra trong quá trình xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
