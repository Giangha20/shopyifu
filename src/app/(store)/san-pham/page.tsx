import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ProductsClientView from './products-client-view';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Bộ Sưu Tập Sản Phẩm Cao Cấp | LUXE SHOP',
  description: 'Khám phá thế giới thời trang thiết kế, đầm lụa tơ tằm, túi xách thủ công và phụ kiện quý phái tại LUXE SHOP.',
  openGraph: {
    title: 'Bộ Sưu Tập Sản Phẩm Cao Cấp | LUXE SHOP',
    description: 'Thời trang dạ hội, túi da và phụ kiện cao cấp cho quý cô hiện đại.',
    images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80' }],
  },
};

function ProductsLoadingSkeleton() {
  return (
    <div className="container-luxe py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block w-72 shrink-0 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoadingSkeleton />}>
      <ProductsClientView />
    </Suspense>
  );
}
