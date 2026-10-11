import React, { Suspense } from 'react';
import { Metadata } from 'next';
import OrderSuccessClient from './order-success-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Đặt Hàng Thành Công | LUXE SHOP',
  description: 'Cảm ơn bạn đã lựa chọn mua sắm tại LUXE SHOP. Đơn hàng của bạn đang được chuẩn bị chu đáo.',
};

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-narrow py-16 text-center">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <OrderSuccessClient />
    </Suspense>
  );
}
