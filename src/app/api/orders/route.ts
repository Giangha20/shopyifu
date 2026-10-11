import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession, logAudit } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validations';
import { generateOrderNumber } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const createOrderSchema = checkoutSchema.extend({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().optional().nullable(),
      quantity: z.number().int().min(1),
    })
  ).min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const rawBody = await request.json();
    const body: Record<string, any> = { ...rawBody };

    if (body.shippingAddress && typeof body.shippingAddress === 'object') {
      if (!body.shippingName) body.shippingName = body.shippingAddress.fullName || body.shippingAddress.name;
      if (!body.shippingPhone) body.shippingPhone = body.shippingAddress.phone;
      if (!body.shippingEmail) body.shippingEmail = body.shippingAddress.email;
      if (!body.shippingProvince) body.shippingProvince = body.shippingAddress.province;
      if (!body.shippingDistrict) body.shippingDistrict = body.shippingAddress.district;
      if (!body.shippingWard) body.shippingWard = body.shippingAddress.ward;
      if (!body.shippingStreet) body.shippingStreet = body.shippingAddress.street;
    }
    if (!body.shippingMethod) body.shippingMethod = 'standard';
    if (!body.paymentMethod) body.paymentMethod = 'cod';

    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu đặt hàng không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    let userId = session?.userId || null;

    // If guest customer provided email, auto link or create customer user account
    if (!userId && data.shippingEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.shippingEmail.toLowerCase().trim() },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const nameParts = data.shippingName.trim().split(' ');
        const firstName = nameParts.slice(-1)[0] || data.shippingName;
        const lastName = nameParts.slice(0, -1).join(' ') || '';

        const newUser = await prisma.user.create({
          data: {
            email: data.shippingEmail.toLowerCase().trim(),
            firstName,
            lastName,
            phone: data.shippingPhone,
          },
        });
        userId = newUser.id;
      }
    }

    // Execute order creation in a single ACID transaction
    const order = await prisma.$transaction(async (tx) => {

      let subtotal = 0;
      const orderItemsData: Array<{
        productId: string;
        variantId: string | null;
        productName: string;
        productSku: string;
        productImage: string | null;
        variantName: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }> = [];

      // Validate each item and calculate DB prices
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            variants: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        });

        if (!product || !product.isActive) {
          throw new Error(`Sản phẩm ${item.productId} không tồn tại hoặc đã ngừng bán`);
        }

        let unitPrice = Number(product.price);
        let availableStock = product.quantity;
        let sku = product.sku;
        let variantName: string | null = null;
        let itemImage: string | null = product.images[0]?.url || null;

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant || !variant.isActive) {
            throw new Error(`Biến thể sản phẩm của ${product.name} không tồn tại`);
          }
          if (variant.price !== null && variant.price !== undefined) {
            unitPrice = Number(variant.price);
          }
          availableStock = variant.quantity;
          sku = variant.sku;
          variantName = variant.name;
          if (variant.image) itemImage = variant.image;
        }

        if (availableStock < item.quantity) {
          throw new Error(
            `Sản phẩm "${product.name}${variantName ? ' - ' + variantName : ''}" chỉ còn ${availableStock} sản phẩm trong kho`
          );
        }

        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          variantId: item.variantId || null,
          productName: product.name,
          productSku: sku,
          productImage: itemImage,
          variantName,
          quantity: item.quantity,
          unitPrice,
          totalPrice: itemTotal,
        });

        // Decrement stock atomically
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { quantity: { decrement: item.quantity } },
          });
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            quantity: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });

        // Record inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            type: 'out',
            quantity: item.quantity,
            reason: 'order_fulfillment',
            performedBy: userId,
            note: `Xuất kho đơn hàng`,
          },
        });
      }

      // Shipping calculation
      let shippingFee = 30000; // Default standard shipping fee
      const shippingMethod = await tx.shippingMethod.findFirst({
        where: {
          isActive: true,
          OR: [
            { id: data.shippingMethod },
            { name: { equals: data.shippingMethod, mode: 'insensitive' } },
          ],
        },
      });

      if (shippingMethod) {
        shippingFee = Number(shippingMethod.baseFee);
        if (shippingMethod.freeAbove && subtotal >= Number(shippingMethod.freeAbove)) {
          shippingFee = 0;
        }
      }

      // Coupon validation & discount calculation
      let discountAmount = 0;
      let appliedCoupon = null;

      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode.toUpperCase() },
        });

        const now = new Date();
        if (
          coupon &&
          coupon.isActive &&
          coupon.startDate <= now &&
          coupon.endDate >= now &&
          (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit) &&
          (coupon.minOrderAmount === null || subtotal >= Number(coupon.minOrderAmount))
        ) {
          // Check per-user limit if user is authenticated
          let canUse = true;
          if (userId && coupon.usageLimitPerUser) {
            const userRedemptions = await tx.couponRedemption.count({
              where: { couponId: coupon.id, userId },
            });
            if (userRedemptions >= coupon.usageLimitPerUser) {
              canUse = false;
            }
          }

          if (canUse) {
            appliedCoupon = coupon;
            if (coupon.type === 'percentage') {
              discountAmount = Math.round((subtotal * Number(coupon.value)) / 100);
              if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
                discountAmount = Number(coupon.maxDiscount);
              }
            } else if (coupon.type === 'fixed_amount') {
              discountAmount = Math.min(Number(coupon.value), subtotal);
            } else if (coupon.type === 'free_shipping') {
              discountAmount = shippingFee;
              shippingFee = 0;
            }
          }
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
      const orderNumber = generateOrderNumber();

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: data.addressId || null,
          shippingName: data.shippingName,
          shippingPhone: data.shippingPhone,
          shippingEmail: data.shippingEmail || null,
          shippingProvince: data.shippingProvince,
          shippingDistrict: data.shippingDistrict,
          shippingWard: data.shippingWard,
          shippingStreet: data.shippingStreet,
          status: 'pending',
          paymentMethod: data.paymentMethod,
          paymentStatus: 'pending',
          shippingMethod: shippingMethod?.name || data.shippingMethod,
          shippingFee: new Prisma.Decimal(shippingFee),
          subtotal: new Prisma.Decimal(subtotal),
          discountAmount: new Prisma.Decimal(discountAmount),
          totalAmount: new Prisma.Decimal(totalAmount),
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          customerNote: data.customerNote || null,
          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              productSku: item.productSku,
              productImage: item.productImage,
              variantName: item.variantName,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              totalPrice: new Prisma.Decimal(item.totalPrice),
            })),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: 'pending',
              note: 'Đơn hàng được khởi tạo thành công',
              changedBy: userId || 'customer',
            },
          },
        },
        include: {
          items: true,
          statusHistory: true,
        },
      });

      // Update coupon usage and log redemption
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usageCount: { increment: 1 } },
        });

        if (userId) {
          await tx.couponRedemption.create({
            data: {
              couponId: appliedCoupon.id,
              userId,
              orderId: newOrder.id,
              amount: new Prisma.Decimal(discountAmount),
            },
          });
        }
      }

      // Clear cart items for this customer/session
      if (userId) {
        await tx.cartItem.deleteMany({
          where: { userId },
        });
      }

      // Create notification for user if registered
      if (userId) {
        await tx.notification.create({
          data: {
            userId,
            type: 'order_status',
            title: 'Đặt hàng thành công',
            message: `Đơn hàng #${orderNumber} của bạn đã được tạo thành công với tổng giá trị ${totalAmount.toLocaleString('vi-VN')}₫`,
            link: `/tai-khoan/don-hang/${newOrder.id}`,
          },
        });
      }

      return newOrder;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    await logAudit(
      userId,
      'create',
      'order',
      order.id,
      { orderNumber: order.orderNumber, totalAmount: Number(order.totalAmount) },
      request
    );

    return NextResponse.json(
      {
        message: 'Đặt hàng thành công',
        data: order,
        order: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi tạo đơn hàng';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để xem đơn hàng' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');

    const where: Prisma.OrderWhereInput = {
      userId: session.userId,
      ...(status ? { status } : {}),
    };

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: orders,
      orders: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List user orders error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách đơn hàng' },
      { status: 500 }
    );
  }
}
