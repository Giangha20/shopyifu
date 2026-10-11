import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Vui lòng nhập mã đơn hàng'),
  phone: z.string().regex(/^(0[1-9])\d{8,9}$/, 'Số điện thoại không hợp lệ'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = trackOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu tra cứu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { orderNumber, phone } = validation.data;
    const cleanPhone = phone.replace(/[\s-]/g, '');

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: { equals: orderNumber.trim(), mode: 'insensitive' },
        shippingPhone: { contains: cleanPhone },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        shippingMethod: true,
        shippingFee: true,
        trackingNumber: true,
        estimatedDelivery: true,
        deliveredAt: true,
        subtotal: true,
        discountAmount: true,
        totalAmount: true,
        createdAt: true,
        shippingName: true,
        shippingProvince: true,
        shippingDistrict: true,
        shippingWard: true,
        items: {
          select: {
            id: true,
            productName: true,
            productSku: true,
            productImage: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng với thông tin đã cung cấp. Vui lòng kiểm tra lại mã đơn và số điện thoại.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi tra cứu đơn hàng' },
      { status: 500 }
    );
  }
}
