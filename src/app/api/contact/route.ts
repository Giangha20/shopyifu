import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { supportTicketSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const validation = supportTicketSchema.safeParse(body);

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

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session?.userId || null,
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: 'open',
        priority: 'normal',
      },
    });

    return NextResponse.json(
      {
        message: 'Yêu cầu của bạn đã được gửi thành công. LUXE SHOP sẽ phản hồi trong thời gian sớm nhất!',
        data: {
          id: ticket.id,
          subject: ticket.subject,
          createdAt: ticket.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact submit error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi gửi yêu cầu liên hệ' },
      { status: 500 }
    );
  }
}
