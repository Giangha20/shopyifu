'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CouponForm } from '@/components/admin/coupon-form';
import { Loader2 } from 'lucide-react';

export default function EditCouponPage() {
  const params = useParams();
  const id = params?.id as string;
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/coupons/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setCoupon(data.coupon);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
        <p className="text-sm text-slate-500">Đang tải mã khuyến mãi...</p>
      </div>
    );
  }

  if (!coupon) return <p className="py-20 text-center text-sm text-rose-600">Không tìm thấy mã!</p>;

  return <CouponForm initialData={coupon} couponId={id} />;
}
