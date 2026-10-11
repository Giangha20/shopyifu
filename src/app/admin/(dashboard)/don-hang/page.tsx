'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Clock, CheckCircle, Package, Truck, XCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { formatPrice, formatDateTime, ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status,
        paymentStatus,
      });

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
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
    fetchOrders();
  }, [page, search, status, paymentStatus]);

  const handleQuickStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Mã đơn',
      cell: (row) => (
        <Link
          href={`/admin/don-hang/${row.id}`}
          className="font-mono font-bold text-slate-900 hover:text-luxury-gold"
        >
          #{row.orderNumber}
        </Link>
      ),
    },
    {
      header: 'Khách hàng',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.customerName}</p>
          <p className="text-2xs text-slate-400">{row.customerPhone}</p>
        </div>
      ),
    },
    {
      header: 'Số lượng SP',
      cell: (row) => <span className="font-medium text-slate-700">{row.itemsCount} sản phẩm</span>,
    },
    {
      header: 'Tổng tiền',
      cell: (row) => (
        <span className="font-bold text-slate-900">{formatPrice(row.totalAmount)}</span>
      ),
      sortable: true,
    },
    {
      header: 'Thanh toán',
      cell: (row) => {
        const meta = PAYMENT_STATUSES[row.paymentStatus] || {
          label: row.paymentStatus,
          color: 'bg-slate-100 text-slate-600',
        };
        return (
          <span className={`inline-block rounded-full px-2 py-0.5 text-2xs font-semibold ${meta.color}`}>
            {meta.label}
          </span>
        );
      },
    },
    {
      header: 'Trạng thái đơn',
      cell: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleQuickStatus(row.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:border-luxury-gold focus:outline-none"
        >
          {Object.entries(ORDER_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Ngày tạo',
      cell: (row) => (
        <span className="text-2xs text-slate-500">{formatDateTime(row.createdAt)}</span>
      ),
      sortable: true,
    },
    {
      header: 'Chi tiết',
      className: 'text-right',
      cell: (row) => (
        <Link
          href={`/admin/don-hang/${row.id}`}
          className="inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Đơn Hàng
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Theo dõi, xử lý và cập nhật tiến độ giao nhận đơn hàng.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={loading}
        searchPlaceholder="Tìm mã đơn, tên khách, số điện thoại..."
        searchValue={search}
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-luxury-gold focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>

            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-luxury-gold focus:outline-none"
            >
              <option value="">Tất cả thanh toán</option>
              {Object.entries(PAYMENT_STATUSES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
}
