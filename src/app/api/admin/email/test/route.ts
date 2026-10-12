import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sendEmail, getTestEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const targetEmail = body.email?.trim();

    if (!targetEmail) {
      return NextResponse.json({ error: 'Vui lòng cung cấp địa chỉ email nhận thư thử nghiệm' }, { status: 400 });
    }

    const testContent = getTestEmail(targetEmail);
    const result = await sendEmail({
      to: targetEmail,
      subject: testContent.subject,
      html: testContent.html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Gửi email không thành công. Vui lòng kiểm tra lại cấu hình SMTP/Gmail.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã gửi email thử nghiệm thành công tới ${targetEmail}! Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam).`,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi gửi email kiểm tra' }, { status: 500 });
  }
}
