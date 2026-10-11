import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { shippingMethodSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const updateShippingSchema = shippingMethodSchema.partial().extend({
  id: z.string().min(1, 'Thiếu mã phương thức vận chuyển'),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const methods = await prisma.shippingMethod.findMany({
      orderBy: [{ sortOrder: 'asc' }, { baseFee: 'asc' }],
    });

    return NextResponse.json({ data: methods });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin list shipping methods error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách phương thức vận chuyển' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const validation = shippingMethodSchema.safeParse(body);

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

    const method = await prisma.shippingMethod.create({
      data: {
        name: data.name,
        description: data.description || null,
        baseFee: new Prisma.Decimal(data.baseFee),
        freeAbove: data.freeAbove ? new Prisma.Decimal(data.freeAbove) : null,
        estimatedDays: data.estimatedDays || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    await logAudit(session.userId, 'create', 'shipping_method', method.id, { name: method.name }, request);

    return NextResponse.json(
      {
        message: 'Tạo phương thức vận chuyển thành công',
        data: method,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin create shipping method error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tạo phương thức vận chuyển' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const validation = updateShippingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id, ...data } = validation.data;

    const existing = await prisma.shippingMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Không tìm thấy phương thức vận chuyển' },
        { status: 404 }
      );
    }

    const updated = await prisma.shippingMethod.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        baseFee: data.baseFee !== undefined ? new Prisma.Decimal(data.baseFee) : undefined,
        freeAbove: data.freeAbove !== undefined ? (data.freeAbove ? new Prisma.Decimal(data.freeAbove) : null) : undefined,
        estimatedDays: data.estimatedDays,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    await logAudit(session.userId, 'update', 'shipping_method', id, { name: updated.name }, request);

    return NextResponse.json({
      message: 'Cập nhật phương thức vận chuyển thành công',
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin update shipping method error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật phương thức vận chuyển' },
      { status: 500 }
    );
  }
}
