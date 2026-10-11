'use client';

import * as React from 'react';
import Link from 'next/link';
import { Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-serif text-2xl font-bold text-luxury-black">
          Đánh giá của tôi
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi nhận xét và chia sẻ cảm nhận của bạn về các sản phẩm đã mua
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 mb-4">
          <Star className="h-7 w-7" />
        </div>
        <h3 className="font-serif text-lg font-bold text-slate-900">
          Chưa có đánh giá nào
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Sau khi nhận hàng thành công, quý khách có thể gửi đánh giá và nhận tích điểm ưu đãi VIP.
        </p>
        <div className="mt-6">
          <Link href="/tai-khoan/don-hang">
            <Button variant="outline" size="md">
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              <span>Xem đơn hàng đã mua</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
