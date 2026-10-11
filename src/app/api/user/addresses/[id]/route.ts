import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { addressSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa chỉ' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = addressSchema.partial().safeParse(body);

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

    const updated = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId: session.userId, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          fullName: data.fullName,
          phone: data.phone,
          province: data.province,
          district: data.district,
          ward: data.ward,
          street: data.street,
          isDefault: data.isDefault,
        },
      });
    });

    return NextResponse.json({
      message: 'Cập nhật địa chỉ thành công',
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('Update address error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật địa chỉ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const address = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa chỉ' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id },
      });

      // If we deleted the default address, set another address as default if exists
      if (address.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId: session.userId },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({
      message: 'Đã xóa địa chỉ thành công',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    console.error('Delete address error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa địa chỉ' },
      { status: 500 }
    );
  }
}
