import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyVNPayReturnUrl } from '@/lib/payment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const result = verifyVNPayReturnUrl(params);
    const orderNumber = result.orderNumber;

    if (!orderNumber) {
      return NextResponse.redirect(new URL('/?error=invalid_order', request.url));
    }

    if (!result.isValid) {
      console.error(`VNPay return URL signature mismatch for order ${orderNumber}`);
      return NextResponse.redirect(
        new URL(`/tai-khoan/don-hang/${orderNumber}?payment=failed&reason=invalid_signature`, request.url)
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.redirect(new URL('/?error=order_not_found', request.url));
    }

    const isSuccess = result.responseCode === '00';

    if (isSuccess) {
      // Update order and payment record
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            paidAt: new Date(),
            status: order.status === 'pending' ? 'confirmed' : order.status,
            paymentReference: result.transactionNo || params['vnp_TransactionNo'] || null,
          },
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            method: 'vnpay',
            amount: order.totalAmount,
            status: 'success',
            transactionId: result.transactionNo || params['vnp_TransactionNo'] || `vnp-${Date.now()}`,
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
              note: 'Thanh toán VNPay thành công',
              changedBy: 'VNPay Gateway',
            },
          });
        }
      });

      return NextResponse.redirect(
        new URL(`/tai-khoan/don-hang/${orderNumber}?payment=success`, request.url)
      );
    } else {
      // Payment was cancelled or failed
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'vnpay',
          amount: order.totalAmount,
          status: 'failed',
          transactionId: result.transactionNo || `vnp-failed-${Date.now()}`,
          gatewayResponse: params,
        },
      });

      return NextResponse.redirect(
        new URL(`/tai-khoan/don-hang/${orderNumber}?payment=failed&code=${result.responseCode}`, request.url)
      );
    }
  } catch (error) {
    console.error('Error handling VNPay return URL:', error);
    return NextResponse.redirect(new URL('/?error=payment_processing_error', request.url));
  }
}
