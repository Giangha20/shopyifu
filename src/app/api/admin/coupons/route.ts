import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { couponSchema } from '@/lib/validations';

export async function GET() {
  try {
    await requireAdmin();
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { redemptions: true } },
      },
    });

    return NextResponse.json({
      coupons: coupons.map((c) => ({
        ...c,
        value: Number(c.value),
        minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
        maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy danh sách khuyến mãi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const validation = couponSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      code,
      name,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      usageLimitPerUser,
      startDate,
      endDate,
      isActive,
    } = body;

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã tồn tại' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        name,
        description,
        type,
        value,
        minOrderAmount: minOrderAmount || null,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        usageLimitPerUser: usageLimitPerUser || 1,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    await logAudit(session.userId, 'create', 'coupon', coupon.id, { code }, request);

    return NextResponse.json({ message: 'Tạo mã khuyến mãi thành công', coupon }, { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Lỗi tạo mã' }, { status: 500 });
  }
}
