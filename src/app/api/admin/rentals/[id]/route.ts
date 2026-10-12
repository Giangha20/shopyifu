import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { rentalBookingAdminUpdateSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const booking = await prisma.rentalBooking.findUnique({
      where: { id },
      include: {
        product: {
          include: { images: true, categories: { include: { category: true } } },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn thuê đồ' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin get rental booking detail error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy chi tiết đơn thuê' },
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

    const existing = await prisma.rentalBooking.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn thuê đồ' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = rentalBookingAdminUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu cập nhật không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const updated = await prisma.rentalBooking.update({
      where: { id },
      data: {
        status: data.status ?? undefined,
        paymentStatus: data.paymentStatus ?? undefined,
        refundedDeposit: data.refundedDeposit !== undefined ? new Prisma.Decimal(data.refundedDeposit) : undefined,
        adminNotes: data.adminNotes !== undefined ? data.adminNotes : undefined,
        itemConditionNotes: data.itemConditionNotes !== undefined ? data.itemConditionNotes : undefined,
      },
      include: {
        product: {
          include: { images: true },
        },
      },
    });

    await logAudit(
      session.userId,
      'update',
      'rental_booking',
      id,
      {
        previousStatus: existing.status,
        newStatus: updated.status,
        previousPaymentStatus: existing.paymentStatus,
        newPaymentStatus: updated.paymentStatus,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Cập nhật đơn thuê thành công',
      booking: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin update rental booking error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật đơn thuê' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    const existing = await prisma.rentalBooking.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn thuê đồ' },
        { status: 404 }
      );
    }

    await prisma.rentalBooking.delete({
      where: { id },
    });

    await logAudit(session.userId, 'delete', 'rental_booking', id, {
      bookingNumber: existing.bookingNumber,
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa đơn thuê đồ thành công',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    console.error('Admin delete rental booking error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa đơn thuê' },
      { status: 500 }
    );
  }
}
