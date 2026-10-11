import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { z } from 'zod';

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  assignedTo: z.string().optional().nullable(),
  response: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Không tìm thấy yêu cầu hỗ trợ' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: ticket });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin get support ticket error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy yêu cầu hỗ trợ' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Không tìm thấy yêu cầu hỗ trợ' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateTicketSchema.safeParse(body);

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
    const now = new Date();

    const updatePayload: Record<string, unknown> = {};
    if (data.status) updatePayload.status = data.status;
    if (data.priority) updatePayload.priority = data.priority;
    if (data.assignedTo !== undefined) updatePayload.assignedTo = data.assignedTo;
    if (data.response !== undefined) {
      updatePayload.response = data.response;
      if (data.response) {
        updatePayload.respondedAt = now;
      }
    }
    if (data.status === 'resolved' || data.status === 'closed') {
      updatePayload.resolvedAt = now;
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: updatePayload,
    });

    // If ticket was responded to and has a user, send notification
    if (data.response && ticket.userId) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'system',
          title: 'Phản hồi yêu cầu hỗ trợ',
          message: `Yêu cầu "${ticket.subject}" của bạn đã nhận được phản hồi từ chăm sóc khách hàng.`,
        },
      });
    }

    await logAudit(session.userId, 'update_support_ticket', 'support_ticket', id, { status: updated.status }, request);

    return NextResponse.json({
      message: 'Cập nhật yêu cầu hỗ trợ thành công',
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin update support ticket error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật yêu cầu hỗ trợ' },
      { status: 500 }
    );
  }
}
