import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const validateCartSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().optional(),
      productId: z.string().min(1),
      variantId: z.string().optional().nullable(),
      quantity: z.number().int().min(1),
      expectedPrice: z.number().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu giỏ hàng không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items } = validation.data;
    const validatedItems: Array<{
      productId: string;
      variantId: string | null;
      requestedQuantity: number;
      availableStock: number;
      actualPrice: number;
      priceChanged: boolean;
      isOutOfStock: boolean;
      isValid: boolean;
      name: string;
      message?: string;
    }> = [];

    let hasErrors = false;
    let newSubtotal = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: true,
        },
      });

      if (!product || !product.isActive) {
        hasErrors = true;
        validatedItems.push({
          productId: item.productId,
          variantId: item.variantId || null,
          requestedQuantity: item.quantity,
          availableStock: 0,
          actualPrice: 0,
          priceChanged: false,
          isOutOfStock: true,
          isValid: false,
          name: product?.name || 'Sản phẩm không xác định',
          message: 'Sản phẩm đã ngừng kinh doanh hoặc không tồn tại',
        });
        continue;
      }

      let currentPrice = Number(product.price);
      let stock = product.quantity;
      let variantName = '';

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant || !variant.isActive) {
          hasErrors = true;
          validatedItems.push({
            productId: item.productId,
            variantId: item.variantId,
            requestedQuantity: item.quantity,
            availableStock: 0,
            actualPrice: 0,
            priceChanged: false,
            isOutOfStock: true,
            isValid: false,
            name: `${product.name} (biến thể không còn)`,
            message: 'Phân loại hàng này đã ngừng bán',
          });
          continue;
        }

        if (variant.price !== null && variant.price !== undefined) {
          currentPrice = Number(variant.price);
        }
        stock = variant.quantity;
        variantName = ` - ${variant.name}`;
      }

      const isOutOfStock = stock < item.quantity;
      const priceChanged =
        item.expectedPrice !== undefined &&
        Math.abs(item.expectedPrice - currentPrice) > 0.01;

      if (isOutOfStock) {
        hasErrors = true;
      }

      const itemTotal = currentPrice * Math.min(item.quantity, stock);
      newSubtotal += itemTotal;

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        requestedQuantity: item.quantity,
        availableStock: stock,
        actualPrice: currentPrice,
        priceChanged,
        isOutOfStock,
        isValid: !isOutOfStock,
        name: `${product.name}${variantName}`,
        message: isOutOfStock
          ? `Kho chỉ còn ${stock} sản phẩm`
          : priceChanged
          ? `Giá đã thay đổi từ ${item.expectedPrice?.toLocaleString()}₫ thành ${currentPrice.toLocaleString()}₫`
          : undefined,
      });
    }

    return NextResponse.json({
      valid: !hasErrors,
      items: validatedItems,
      subtotal: newSubtotal,
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi kiểm tra giỏ hàng' },
      { status: 500 }
    );
  }
}
