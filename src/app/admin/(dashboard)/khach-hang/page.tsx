'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Lock, Unlock, Mail, Phone, Calendar } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
      });

      const res = await fetch(`/api/admin/customers?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !currentActive } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Khách hàng',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
            {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <Link
              href={`/admin/khach-hang/${row.id}`}
              className="font-semibold text-slate-900 hover:text-luxury-gold"
            >
              {row.name}
            </Link>
            <p className="text-2xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Số điện thoại',
      cell: (row) => <span className="text-xs text-slate-600">{row.phone}</span>,
    },
    {
      header: 'Đơn hàng',
      cell: (row) => (
        <span className="font-semibold text-slate-800">{row.ordersCount} đơn</span>
      ),
      sortable: true,
    },
    {
      header: 'Tổng chi tiêu',
      cell: (row) => (
        <span className="font-bold text-luxury-gold">{formatPrice(row.totalSpent)}</span>
      ),
      sortable: true,
    },
    {
      header: 'Trạng thái',
      cell: (row) => (
        <button
          onClick={() => handleToggleActive(row.id, row.isActive)}
          className="inline-flex items-center gap-1 cursor-pointer"
        >
          {row.isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <Unlock className="h-3 w-3" /> Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
              <Lock className="h-3 w-3" /> Đã khóa
            </span>
          )}
        </button>
      ),
    },
    {
      header: 'Ngày tham gia',
      cell: (row) => <span className="text-2xs text-slate-400">{formatDate(row.createdAt)}</span>,
      sortable: true,
    },
    {
      header: 'Chi tiết',
      className: 'text-right',
      cell: (row) => (
        <Link
          href={`/admin/khach-hang/${row.id}`}
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
          Quản Lý Khách Hàng
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Danh sách tài khoản thành viên và lịch sử chi tiêu tại LUXE SHOP.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={loading}
        searchPlaceholder="Tìm theo tên, email, số điện thoại..."
        searchValue={search}
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />
    </div>
  );
}
