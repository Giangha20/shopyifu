'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, EyeOff, ShieldCheck, ThumbsUp } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id: string, isApproved: boolean, isHidden: boolean) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved, isHidden }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved, isHidden } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Sản phẩm',
      cell: (row) => <span className="font-semibold text-slate-900">{row.productName}</span>,
    },
    {
      header: 'Khách hàng',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.customerName}</p>
          <p className="text-2xs text-slate-400">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Đánh giá',
      cell: (row) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < row.rating ? 'fill-luxury-gold text-luxury-gold' : 'text-slate-200'
              }`}
            />
          ))}
          <span className="ml-1 text-2xs font-bold text-slate-700">{row.rating}/5</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Nội dung nhận xét',
      cell: (row) => (
        <div className="max-w-md">
          {row.title && <p className="font-semibold text-slate-900 text-xs">{row.title}</p>}
          <p className="text-xs text-slate-600 line-clamp-2">{row.content || 'Không có bình luận'}</p>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      cell: (row) => {
        if (row.isHidden) {
          return (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-2xs font-semibold text-rose-700">
              Đã ẩn
            </span>
          );
        }
        return row.isApproved ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-semibold text-emerald-700">
            Đã duyệt
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-2xs font-semibold text-amber-700">
            Chờ duyệt
          </span>
        );
      },
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {!row.isApproved && (
            <button
              onClick={() => handleModerate(row.id, true, false)}
              className="rounded-lg bg-emerald-50 px-2 py-1 text-2xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Duyệt
            </button>
          )}
          <button
            onClick={() => handleModerate(row.id, row.isApproved, !row.isHidden)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-2xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            {row.isHidden ? 'Bỏ ẩn' : 'Ẩn review'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
          Quản Lý Đánh Giá & Nhận Xét
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Kiểm duyệt phản hồi, xếp hạng sao và hình ảnh từ người mua thực tế.
        </p>
      </div>

      <DataTable columns={columns} data={reviews} isLoading={loading} />
    </div>
  );
}
