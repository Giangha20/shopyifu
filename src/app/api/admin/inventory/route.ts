import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const lowStockOnly = searchParams.get('lowStock') === 'true';

    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (lowStockOnly) {
      where.quantity = { lte: 10 };
    }

    const [products, total, recentMovements] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { quantity: 'asc' },
        include: {
          images: { take: 1, orderBy: { isPrimary: 'desc' } },
        },
      }),
      prisma.product.count({ where }),
      prisma.inventoryMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
        },
      }),
    ]);

    return NextResponse.json({
      inventory: products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        lowStockThreshold: p.lowStockThreshold,
        soldCount: p.soldCount,
        image: p.images[0]?.url || '/placeholder.jpg',
      })),
      recentMovements: recentMovements.map((m) => ({
        id: m.id,
        productName: m.product.name,
        sku: m.product.sku,
        type: m.type,
        quantity: m.quantity,
        reason: m.reason,
        performedBy: m.performedBy,
        createdAt: m.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy tồn kho' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { productId, quantityChange, type, reason, note } = body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    const delta = type === 'out' ? -Math.abs(quantityChange) : Math.abs(quantityChange);
    const newQuantity = Math.max(0, product.quantity + delta);

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      }),
      prisma.inventoryMovement.create({
        data: {
          productId,
          type,
          quantity: Math.abs(quantityChange),
          reason: reason || 'Điều chỉnh kho thủ công',
          performedBy: session.email,
          note,
        },
      }),
    ]);

    await logAudit(
      session.userId,
      'adjust_inventory',
      'product',
      productId,
      { before: product.quantity, after: newQuantity, change: delta, reason },
      request
    );

    return NextResponse.json({ message: 'Điều chỉnh kho thành công', product: updatedProduct });
  } catch (error) {
    console.error('Adjust inventory error:', error);
    return NextResponse.json({ error: 'Lỗi điều chỉnh tồn kho' }, { status: 500 });
  }
}
