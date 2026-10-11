'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-serif text-2xl font-bold text-luxury-black">
          Sản phẩm yêu thích
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lưu lại những bộ trang phục và phụ kiện cao cấp bạn yêu thích để mua sau
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
          <Heart className="h-7 w-7" />
        </div>
        <h3 className="font-serif text-lg font-bold text-slate-900">
          Danh sách yêu thích trống
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Khám phá bộ sưu tập thời trang thượng lưu của LUXE SHOP và nhấn biểu tượng trái tim để lưu sản phẩm yêu thích.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button variant="gold" size="md">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              <span>Khám phá ngay</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
