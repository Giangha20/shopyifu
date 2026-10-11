import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const entity = searchParams.get('entity') || '';
    const action = searchParams.get('action') || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        userName: l.user ? `${l.user.lastName} ${l.user.firstName}`.trim() : 'Hệ thống',
        userEmail: l.user?.email || 'system',
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        changes: l.changes,
        ipAddress: l.ipAddress || '—',
        createdAt: l.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy nhật ký' }, { status: 500 });
  }
}
