'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CouponFormProps {
  initialData?: any;
  couponId?: string;
}

export function CouponForm({ initialData, couponId }: CouponFormProps) {
  const router = useRouter();
  const isEdit = Boolean(couponId);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState(initialData?.code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState(initialData?.type || 'percentage');
  const [value, setValue] = useState(initialData?.value ? String(initialData.value) : '10');
  const [minOrderAmount, setMinOrderAmount] = useState(
    initialData?.minOrderAmount ? String(initialData.minOrderAmount) : ''
  );
  const [maxDiscount, setMaxDiscount] = useState(
    initialData?.maxDiscount ? String(initialData.maxDiscount) : ''
  );
  const [usageLimit, setUsageLimit] = useState(
    initialData?.usageLimit ? String(initialData.usageLimit) : '100'
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate
      ? new Date(initialData.endDate).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [isActive, setIsActive] = useState(
    initialData?.isActive !== undefined ? initialData.isActive : true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive,
      };

      const url = isEdit ? `/api/admin/coupons/${couponId}` : '/api/admin/coupons';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra');
        return;
      }

      router.push('/admin/khuyen-mai');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/khuyen-mai"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Chỉnh Sửa Mã Khuyến Mãi' : 'Thêm Mã Khuyến Mãi'}
          </h1>
          <p className="text-xs text-slate-500">Cấu hình chiết khấu cho khách hàng khi thanh toán.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Mã Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LUXE2026"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-mono font-bold focus:border-luxury-gold focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Tên chương trình *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Giảm 10% Khách VIP"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Loại chiết khấu</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
              <option value="free_shipping">Miễn phí vận chuyển</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Giá trị giảm *</label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === 'percentage' ? '15' : '100000'}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Đơn hàng tối thiểu (VNĐ)</label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="500000"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Giảm tối đa (VNĐ)</label>
            <input
              type="number"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder="200000"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Ngày bắt đầu</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Ngày kết thúc</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Giới hạn số lần dùng</label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-700">Mô tả điều kiện áp dụng</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-luxury-gold"
            />
            <span>Kích hoạt mã ngay</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link href="/admin/khuyen-mai">
          <Button type="button" variant="outline">Hủy bỏ</Button>
        </Link>
        <Button type="submit" disabled={loading} className="bg-luxury-black text-white hover:bg-luxury-black-light">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Lưu thay đổi' : 'Tạo mã'}
        </Button>
      </div>
    </form>
  );
}
