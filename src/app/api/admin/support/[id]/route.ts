import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!ticket) return NextResponse.json({ error: 'Không tìm thấy ticket' }, { status: 404 });
    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { status, priority, response } = body;

    const updated = await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        priority: priority || undefined,
        response: response || undefined,
        respondedAt: response ? new Date() : undefined,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
      },
    });

    await logAudit(session.userId, 'respond_ticket', 'support_ticket', params.id, { status, priority }, request);

    return NextResponse.json({ message: 'Cập nhật hỗ trợ thành công', ticket: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
  }
}
