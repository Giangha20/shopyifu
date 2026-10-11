import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyVNPayIPN } from '@/lib/payment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const verifyResult = verifyVNPayIPN(params);

    if (!verifyResult.isValid) {
      console.error('VNPay IPN Checksum Invalid');
      return NextResponse.json({ RspCode: '97', Message: 'Checksum failed' });
    }

    const { orderNumber, responseCode, amount } = verifyResult;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json({ RspCode: '01', Message: 'Order not found' });
    }

    // Verify amount
    if (Math.round(Number(order.totalAmount)) !== Math.round(amount)) {
      return NextResponse.json({ RspCode: '04', Message: 'Invalid amount' });
    }

    // Check if order already confirmed
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    if (responseCode === '00') {
      // Payment successful
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            paidAt: new Date(),
            status: order.status === 'pending' ? 'confirmed' : order.status,
            paymentReference: params['vnp_TransactionNo'] || null,
          },
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            method: 'vnpay',
            amount: order.totalAmount,
            status: 'success',
            transactionId: params['vnp_TransactionNo'] || `vnp-${Date.now()}`,
            gatewayResponse: params,
            paidAt: new Date(),
          },
        });

        if (order.status === 'pending') {
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: 'pending',
              toStatus: 'confirmed',
              note: 'Xác nhận thanh toán tự động qua VNPay IPN',
              changedBy: 'VNPay Webhook',
            },
          });
        }
      });

      return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    } else {
      // Payment failed
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'vnpay',
          amount: order.totalAmount,
          status: 'failed',
          transactionId: params['vnp_TransactionNo'] || `vnp-${Date.now()}`,
          gatewayResponse: params,
        },
      });

      return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
    }
  } catch (error) {
    console.error('Error in VNPay IPN webhook:', error);
    return NextResponse.json({ RspCode: '99', Message: 'Unknown error' });
  }
}
