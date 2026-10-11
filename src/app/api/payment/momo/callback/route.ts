import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyMoMoCallback } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const verifyResult = verifyMoMoCallback(body);

    if (!verifyResult.isValid) {
      console.error('MoMo IPN Callback Signature Mismatch');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const { orderId, resultCode, transId } = verifyResult;

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
    });

    if (!order) {
      console.error(`Order not found for MoMo callback: ${orderId}`);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (resultCode === 0) {
      // Payment success
      if (order.paymentStatus !== 'paid') {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'paid',
              paidAt: new Date(),
              status: order.status === 'pending' ? 'confirmed' : order.status,
              paymentReference: transId || null,
            },
          });

          await tx.payment.create({
            data: {
              orderId: order.id,
              method: 'momo',
              amount: order.totalAmount,
              status: 'success',
              transactionId: transId || `momo-${Date.now()}`,
              gatewayResponse: body,
              paidAt: new Date(),
            },
          });

          if (order.status === 'pending') {
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                fromStatus: 'pending',
                toStatus: 'confirmed',
                note: 'Thanh toán MoMo thành công qua webhook IPN',
                changedBy: 'MoMo Gateway',
              },
            });
          }
        });
      }
    } else {
      // Payment failed
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'momo',
          amount: order.totalAmount,
          status: 'failed',
          transactionId: transId || `momo-${Date.now()}`,
          gatewayResponse: body,
        },
      });
    }

    // MoMo expects HTTP 204 No Content or HTTP 200 with message
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error handling MoMo IPN callback:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
