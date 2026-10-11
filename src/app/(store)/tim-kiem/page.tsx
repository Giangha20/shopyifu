import React, { Suspense } from 'react';
import { Metadata } from 'next';
import SearchClientView from './search-client-view';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Tìm Kiếm Sản Phẩm | LUXE SHOP',
  description: 'Tìm kiếm trang phục dạ hội, phụ kiện lụa và túi xách da cao cấp tại LUXE SHOP.',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-luxe py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <SearchClientView />
    </Suspense>
  );
}
