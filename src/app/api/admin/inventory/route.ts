import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;

    const isExport = searchParams.get('export') === 'true' || searchParams.get('export') === 'csv';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = isExport ? 2000 : Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '15')));
    const search = searchParams.get('search')?.trim() || '';
    const filter = searchParams.get('filter') || '';
    const lowStockOnly = searchParams.get('lowStock') === 'true' || filter === 'low_stock';
    const outOfStockOnly = filter === 'out_of_stock';
    const inStockOnly = filter === 'in_stock';

    const skip = isExport ? 0 : (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (outOfStockOnly) {
      where.quantity = 0;
    } else if (lowStockOnly) {
      where.quantity = { gt: 0, lte: 10 };
    } else if (inStockOnly) {
      where.quantity = { gt: 10 };
    }

    const [products, total, recentMovements, statsAgg] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { quantity: 'asc' },
        include: {
          images: { take: 1, orderBy: { isPrimary: 'desc' } },
          variants: {
            select: {
              id: true,
              name: true,
              sku: true,
              quantity: true,
              color: true,
              size: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
      prisma.inventoryMovement.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
        },
      }),
      prisma.product.aggregate({
        where: { isActive: true },
        _sum: { quantity: true, soldCount: true },
        _count: { id: true },
      }),
    ]);

    const [outOfStockCount, lowStockCount] = await Promise.all([
      prisma.product.count({ where: { isActive: true, quantity: 0 } }),
      prisma.product.count({ where: { isActive: true, quantity: { gt: 0, lte: 10 } } }),
    ]);

    return NextResponse.json({
      inventory: products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price),
        quantity: p.quantity,
        lowStockThreshold: p.lowStockThreshold || 5,
        soldCount: p.soldCount,
        image: p.images[0]?.url || '/placeholder.jpg',
        variants: p.variants,
      })),
      recentMovements: recentMovements.map((m) => ({
        id: m.id,
        productId: m.productId,
        productName: m.product?.name || 'Sản phẩm',
        sku: m.product?.sku || '',
        type: m.type,
        quantity: m.quantity,
        reason: m.reason,
        performedBy: m.performedBy,
        note: m.note,
        createdAt: m.createdAt,
      })),
      stats: {
        totalProducts: statsAgg._count.id || 0,
        totalQuantity: statsAgg._sum.quantity || 0,
        totalSold: statsAgg._sum.soldCount || 0,
        outOfStockCount,
        lowStockCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json({ error: 'Lỗi lấy dữ liệu tồn kho' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    // Support Batch Import / Batch Upload
    if (Array.isArray(body.batch) && body.batch.length > 0) {
      const results: { sku: string; status: 'success' | 'not_found' | 'error'; oldQty?: number; newQty?: number }[] = [];
      let successCount = 0;

      for (const item of body.batch) {
        const itemSku = (item.sku || '').trim();
        const itemProductId = item.productId;
        const change = Number(item.quantityChange !== undefined ? item.quantityChange : item.quantity);
        const mode = item.mode || 'adjust'; // 'adjust' (+/-) or 'set' (exact new qty)
        const type = item.type || (change >= 0 ? 'in' : 'out');
        const reason = item.reason || 'Nhập kho hàng loạt / Tải lên file';
        const note = item.note || '';

        try {
          const product = await prisma.product.findFirst({
            where: itemProductId ? { id: itemProductId } : { sku: itemSku },
          });

          if (!product) {
            results.push({ sku: itemSku || itemProductId, status: 'not_found' });
            continue;
          }

          let newQuantity = product.quantity;
          if (mode === 'set') {
            newQuantity = Math.max(0, change);
          } else {
            const delta = type === 'out' ? -Math.abs(change) : Math.abs(change);
            newQuantity = Math.max(0, product.quantity + delta);
          }

          const diff = Math.abs(newQuantity - product.quantity);

          await prisma.$transaction([
            prisma.product.update({
              where: { id: product.id },
              data: { quantity: newQuantity },
            }),
            prisma.inventoryMovement.create({
              data: {
                productId: product.id,
                type: newQuantity >= product.quantity ? 'in' : 'out',
                quantity: diff,
                reason,
                performedBy: session.email,
                note: note || `Cập nhật hàng loạt (Cũ: ${product.quantity} -> Mới: ${newQuantity})`,
              },
            }),
          ]);

          successCount++;
          results.push({
            sku: product.sku,
            status: 'success',
            oldQty: product.quantity,
            newQty: newQuantity,
          });
        } catch (itemErr) {
          results.push({ sku: itemSku, status: 'error' });
        }
      }

      await logAudit(
        session.userId,
        'batch_adjust_inventory',
        'inventory',
        'batch',
        { count: successCount, totalSubmitted: body.batch.length },
        request
      );

      return NextResponse.json({
        message: `Đã cập nhật thành công ${successCount}/${body.batch.length} sản phẩm`,
        successCount,
        total: body.batch.length,
        results,
      });
    }

    // Single product adjustment
    const { productId, quantityChange, type = 'in', reason = 'Nhập hàng bổ sung', note = '' } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Thiếu productId' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    const qtyNum = Math.abs(Number(quantityChange) || 0);
    const delta = type === 'out' ? -qtyNum : qtyNum;
    const newQuantity = Math.max(0, product.quantity + delta);

    const [updatedProduct] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      }),
      prisma.inventoryMovement.create({
        data: {
          productId,
          type,
          quantity: qtyNum,
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

    return NextResponse.json({
      message: 'Điều chỉnh kho thành công',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Adjust inventory error:', error);
    return NextResponse.json({ error: 'Lỗi điều chỉnh tồn kho' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { productId, quantity, reason = 'Cập nhật nhanh tồn kho' } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Thiếu productId hoặc số lượng tồn kho' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    const newQuantity = Math.max(0, parseInt(String(quantity), 10) || 0);
    const diff = newQuantity - product.quantity;

    const [updatedProduct] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      }),
      prisma.inventoryMovement.create({
        data: {
          productId,
          type: diff >= 0 ? 'in' : 'out',
          quantity: Math.abs(diff),
          reason: reason || 'Cập nhật trực tiếp số lượng kho',
          performedBy: session.email,
          note: `Số lượng từ ${product.quantity} thành ${newQuantity}`,
        },
      }),
    ]);

    await logAudit(
      session.userId,
      'update_inventory_quantity',
      'product',
      productId,
      { before: product.quantity, after: newQuantity },
      request
    );

    return NextResponse.json({
      message: 'Cập nhật số lượng kho thành công',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Direct inventory update error:', error);
    return NextResponse.json({ error: 'Lỗi cập nhật số lượng tồn kho' }, { status: 500 });
  }
}
