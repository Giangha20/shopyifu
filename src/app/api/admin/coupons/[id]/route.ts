import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
    if (!coupon) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

    return NextResponse.json({
      coupon: {
        ...coupon,
        value: Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const existing = await prisma.coupon.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy mã' }, { status: 404 });

    const updated = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: body.code ?? existing.code,
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        type: body.type ?? existing.type,
        value: body.value !== undefined ? body.value : existing.value,
        minOrderAmount: body.minOrderAmount !== undefined ? body.minOrderAmount : existing.minOrderAmount,
        maxDiscount: body.maxDiscount !== undefined ? body.maxDiscount : existing.maxDiscount,
        usageLimit: body.usageLimit !== undefined ? body.usageLimit : existing.usageLimit,
        startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
        endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      },
    });

    await logAudit(session.userId, 'update', 'coupon', params.id, { code: updated.code }, request);

    return NextResponse.json({ message: 'Cập nhật thành công', coupon: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    await prisma.coupon.delete({ where: { id: params.id } });
    await logAudit(session.userId, 'delete', 'coupon', params.id, undefined, request);
    return NextResponse.json({ message: 'Xóa thành công' });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi xóa' }, { status: 500 });
  }
}
