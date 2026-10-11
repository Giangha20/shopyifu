import React, { Suspense } from 'react';
import { Metadata } from 'next';
import OrderTrackingClient from './order-tracking-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Tra Cứu Tiến Độ Đơn Hàng | LUXE SHOP',
  description: 'Kiểm tra trạng thái vận chuyển và hành trình đơn hàng cao cấp của bạn tại LUXE SHOP.',
};

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="container-narrow py-12">
          <Skeleton className="h-8 w-64 mx-auto mb-6" />
          <Skeleton className="h-48 w-full rounded-2xl mb-8" />
        </div>
      }
    >
      <OrderTrackingClient />
    </Suspense>
  );
}
