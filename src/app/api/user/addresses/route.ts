import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ data: addresses });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('List addresses error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách địa chỉ' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const validation = addressSchema.safeParse(body);

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

    // Check count of addresses
    const count = await prisma.address.count({
      where: { userId: session.userId },
    });

    // If first address, make default
    const shouldBeDefault = count === 0 ? true : Boolean(data.isDefault);

    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId: session.userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: session.userId,
          fullName: data.fullName,
          phone: data.phone,
          province: data.province,
          district: data.district,
          ward: data.ward,
          street: data.street,
          isDefault: shouldBeDefault,
        },
      });
    });

    return NextResponse.json(
      {
        message: 'Thêm địa chỉ thành công',
        data: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('Create address error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi thêm địa chỉ' },
      { status: 500 }
    );
  }
}
