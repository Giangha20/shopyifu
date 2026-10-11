import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { addToCartSchema, updateCartItemSchema } from '@/lib/validations';
import { cookies } from 'next/headers';

async function getCartIdentifiers(request: NextRequest) {
  const session = await getSession();
  const cookieStore = await cookies();
  let guestSessionId =
    request.headers.get('x-session-id') ||
    cookieStore.get('cart_session_id')?.value;

  if (!session && !guestSessionId) {
    guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  return {
    userId: session?.userId || null,
    sessionId: guestSessionId || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionId } = await getCartIdentifiers(request);

    const cartItems = await prisma.cartItem.findMany({
      where: userId
        ? { userId }
        : { sessionId: sessionId || '' },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = cartItems.map((item) => {
      const price = item.variant?.price ?? item.product.price;
      const availableStock = item.variant ? item.variant.quantity : item.product.quantity;
      const isAvailable = (item.variant ? item.variant.isActive : item.product.isActive) && availableStock >= item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.product.name,
        slug: item.product.slug,
        image: item.variant?.image || item.product.images[0]?.url || null,
        variantName: item.variant?.name || null,
        price: Number(price),
        totalPrice: Number(price) * item.quantity,
        stock: availableStock,
        isAvailable,
      };
    });

    const subtotal = items.reduce((acc, curr) => acc + (curr.isAvailable ? curr.totalPrice : 0), 0);
    const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);

    const response = NextResponse.json({
      items,
      subtotal,
      totalItems,
      sessionId,
    });

    if (!userId && sessionId) {
      response.cookies.set('cart_session_id', sessionId, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy giỏ hàng' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await getCartIdentifiers(request);
    const body = await request.json();
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { productId, variantId, quantity } = validation.data;

    // Check product in database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh' },
        { status: 404 }
      );
    }

    let availableStock = product.quantity;
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant || !variant.isActive) {
        return NextResponse.json(
          { error: 'Biến thể sản phẩm không tồn tại hoặc đã ngừng bán' },
          { status: 404 }
        );
      }
      availableStock = variant.quantity;
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        ...(userId ? { userId } : { sessionId }),
        productId,
        variantId: variantId || null,
      },
    });

    const totalQuantity = (existingCartItem?.quantity || 0) + quantity;

    if (totalQuantity > availableStock) {
      return NextResponse.json(
        {
          error: `Số lượng yêu cầu (${totalQuantity}) vượt quá số lượng còn lại trong kho (${availableStock})`,
        },
        { status: 400 }
      );
    }

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: totalQuantity },
        include: { product: true, variant: true },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          sessionId: userId ? null : sessionId,
          productId,
          variantId: variantId || null,
          quantity,
        },
        include: { product: true, variant: true },
      });
    }

    const response = NextResponse.json(
      {
        message: 'Đã thêm vào giỏ hàng',
        data: cartItem,
      },
      { status: 201 }
    );

    if (!userId && sessionId) {
      response.cookies.set('cart_session_id', sessionId, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi thêm vào giỏ hàng' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, sessionId } = await getCartIdentifiers(request);
    const body = await request.json();
    const validation = updateCartItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id, quantity } = validation.data;

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        ...(userId ? { userId } : { sessionId }),
      },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Không tìm thấy mục trong giỏ hàng' },
        { status: 404 }
      );
    }

    const availableStock = cartItem.variant
      ? cartItem.variant.quantity
      : cartItem.product.quantity;

    if (quantity > availableStock) {
      return NextResponse.json(
        {
          error: `Số lượng vượt quá số lượng hàng tồn kho (${availableStock})`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
      include: { product: true, variant: true },
    });

    return NextResponse.json({
      message: 'Cập nhật số lượng thành công',
      data: updated,
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi cập nhật giỏ hàng' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, sessionId } = await getCartIdentifiers(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (searchParams.get('clear') === 'true') {
      await prisma.cartItem.deleteMany({
        where: userId ? { userId } : { sessionId: sessionId || '' },
      });
      return NextResponse.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu mã mục giỏ hàng' },
        { status: 400 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        ...(userId ? { userId } : { sessionId }),
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Không tìm thấy mục cần xóa' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return NextResponse.json({
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
    });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng' },
      { status: 500 }
    );
  }
}
