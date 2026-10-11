import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { newsletterSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = newsletterSchema.safeParse(body);

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

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true, unsubscribedAt: null },
        });
      }
      return NextResponse.json({
        message: 'Bạn đã đăng ký nhận bản tin từ LUXE SHOP trước đó.',
      });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        isActive: true,
      },
    });

    // Also update user record if user with this email exists
    await prisma.user.updateMany({
      where: { email: normalizedEmail },
      data: { newsletterSubscribed: true },
    });

    return NextResponse.json(
      {
        message: 'Cảm ơn bạn đã đăng ký nhận bản tin từ LUXE SHOP!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi đăng ký nhận tin' },
      { status: 500 }
    );
  }
}
