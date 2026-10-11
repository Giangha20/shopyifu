import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const validateCouponSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã giảm giá'),
  subtotal: z.number().min(0, 'Tổng giá trị đơn hàng không hợp lệ'),
  items: z.array(
    z.object({
      productId: z.string(),
      categoryId: z.string().optional(),
      price: z.number(),
      quantity: z.number(),
    })
  ).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const validation = validateCouponSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { code, subtotal, items } = validation.data;
    const cleanCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: 'Mã giảm giá không tồn tại hoặc đã ngừng áp dụng' },
        { status: 404 }
      );
    }

    const now = new Date();

    if (coupon.startDate > now) {
      return NextResponse.json(
        { valid: false, error: 'Chương trình khuyến mãi chưa bắt đầu' },
        { status: 400 }
      );
    }

    if (coupon.endDate < now) {
      return NextResponse.json(
        { valid: false, error: 'Mã giảm giá đã hết hạn sử dụng' },
        { status: 400 }
      );
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: 'Mã giảm giá đã hết lượt sử dụng' },
        { status: 400 }
      );
    }

    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json(
        {
          valid: false,
          error: `Đơn hàng tối thiểu ${Number(coupon.minOrderAmount).toLocaleString('vi-VN')}₫ để áp dụng mã này`,
        },
        { status: 400 }
      );
    }

    if (session && coupon.usageLimitPerUser) {
      const userRedemptions = await prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
          userId: session.userId,
        },
      });

      if (userRedemptions >= coupon.usageLimitPerUser) {
        return NextResponse.json(
          {
            valid: false,
            error: `Bạn đã sử dụng hết lượt cho phép (${coupon.usageLimitPerUser} lần) với mã này`,
          },
          { status: 400 }
        );
      }
    }

    // Check restrictions if specified
    let eligibleSubtotal = subtotal;

    if (
      (coupon.applicableProducts.length > 0 || coupon.applicableCategories.length > 0) &&
      items &&
      items.length > 0
    ) {
      const eligibleItems = items.filter((item) => {
        const matchesProduct =
          coupon.applicableProducts.length === 0 ||
          coupon.applicableProducts.includes(item.productId);

        const matchesCategory =
          coupon.applicableCategories.length === 0 ||
          (item.categoryId && coupon.applicableCategories.includes(item.categoryId));

        return matchesProduct && matchesCategory;
      });

      if (eligibleItems.length === 0) {
        return NextResponse.json(
          { valid: false, error: 'Mã giảm giá không áp dụng cho các sản phẩm trong giỏ hàng này' },
          { status: 400 }
        );
      }

      eligibleSubtotal = eligibleItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((eligibleSubtotal * Number(coupon.value)) / 100);
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = Math.min(Number(coupon.value), eligibleSubtotal);
    } else if (coupon.type === 'free_shipping') {
      discountAmount = 0; // Handled as shipping discount in checkout
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: Number(coupon.value),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
      },
      discountAmount,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi kiểm tra mã giảm giá' },
      { status: 500 }
    );
  }
}
