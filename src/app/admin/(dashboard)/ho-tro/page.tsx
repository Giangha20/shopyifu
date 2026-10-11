'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LifeBuoy, Eye, Clock, CheckCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { formatDateTime } from '@/lib/utils';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/support');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const columns: Column<any>[] = [
    {
      header: 'Tiêu đề yêu cầu',
      cell: (row) => (
        <div>
          <Link
            href={`/admin/ho-tro/${row.id}`}
            className="font-semibold text-slate-900 hover:text-luxury-gold block"
          >
            {row.subject}
          </Link>
          <span className="text-2xs text-slate-400 line-clamp-1">{row.message}</span>
        </div>
      ),
    },
    {
      header: 'Khách hàng',
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.name}</p>
          <p className="text-2xs text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Độ ưu tiên',
      cell: (row) => {
        const priorityColors: Record<string, string> = {
          urgent: 'bg-rose-50 text-rose-700',
          high: 'bg-amber-50 text-amber-700',
          normal: 'bg-blue-50 text-blue-700',
          low: 'bg-slate-100 text-slate-600',
        };
        const priorityLabels: Record<string, string> = {
          urgent: 'Khẩn cấp',
          high: 'Cao',
          normal: 'Bình thường',
          low: 'Thấp',
        };
        return (
          <span
            className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${
              priorityColors[row.priority] || priorityColors.normal
            }`}
          >
            {priorityLabels[row.priority] || row.priority}
          </span>
        );
      },
    },
    {
      header: 'Trạng thái',
      cell: (row) => {
        const statusMeta: Record<string, { label: string; color: string }> = {
          open: { label: 'Mới mở', color: 'bg-rose-50 text-rose-700' },
          in_progress: { label: 'Đang xử lý', color: 'bg-amber-50 text-amber-700' },
          resolved: { label: 'Đã giải quyết', color: 'bg-emerald-50 text-emerald-700' },
          closed: { label: 'Đã đóng', color: 'bg-slate-100 text-slate-600' },
        };
        const s = statusMeta[row.status] || { label: row.status, color: 'bg-slate-100 text-slate-600' };
        return (
          <span className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${s.color}`}>
            {s.label}
          </span>
        );
      },
    },
    {
      header: 'Thời gian gửi',
      cell: (row) => <span className="text-2xs text-slate-500">{formatDateTime(row.createdAt)}</span>,
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      cell: (row) => (
        <Link
          href={`/admin/ho-tro/${row.id}`}
          className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
          Hỗ Trợ Khách Hàng (Support Tickets)
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Tiếp nhận và phản hồi giải đáp thắc mắc, khiếu nại từ người mua hàng.
        </p>
      </div>

      <DataTable columns={columns} data={tickets} isLoading={loading} />
    </div>
  );
}
