'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Tag, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mã khuyến mãi này?')) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Mã Coupon',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
            {row.code}
          </span>
          <span className="text-xs text-slate-600 font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Loại & Giá trị',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900">
            {row.type === 'percentage'
              ? `${row.value}%`
              : row.type === 'free_shipping'
              ? 'Miễn phí ship'
              : formatPrice(row.value)}
          </span>
          {row.minOrderAmount && (
            <span className="block text-2xs text-slate-400">
              Đơn từ {formatPrice(row.minOrderAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Đã dùng',
      cell: (row) => (
        <span className="text-xs text-slate-700">
          {row.usageCount} {row.usageLimit ? `/ ${row.usageLimit}` : 'lần'}
        </span>
      ),
    },
    {
      header: 'Thời hạn',
      cell: (row) => (
        <span className="text-2xs text-slate-500">
          {formatDate(row.startDate)} - {formatDate(row.endDate)}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      cell: (row) => (
        <button
          onClick={() => handleToggle(row.id, row.isActive)}
          className="inline-flex items-center gap-1 cursor-pointer"
        >
          {row.isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <CheckCircle className="h-3 w-3" /> Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              <XCircle className="h-3 w-3" /> Tạm dừng
            </span>
          )}
        </button>
      ),
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/khuyen-mai/${row.id}`}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Mã Giảm Giá & Khuyến Mãi
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Quản lý phiếu giảm giá, chiết khấu và quà tặng tri ân khách hàng.
          </p>
        </div>

        <Link href="/admin/khuyen-mai/them">
          <Button className="bg-luxury-black text-white hover:bg-luxury-black-light shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Tạo mã khuyến mãi
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={coupons} isLoading={loading} />
    </div>
  );
}
