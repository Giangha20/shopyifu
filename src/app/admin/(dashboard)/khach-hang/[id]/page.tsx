'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Lock,
  Unlock,
  ShoppingBag,
  CreditCard,
  MapPin,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate, formatDateTime, ORDER_STATUSES } from '@/lib/utils';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setCustomer(data.customer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const handleToggleLock = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !customer.isActive }),
      });
      if (res.ok) {
        setCustomer({ ...customer, isActive: !customer.isActive });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
        <p className="text-sm text-slate-500">Đang tải hồ sơ khách hàng...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-rose-600">Không tìm thấy khách hàng!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/khach-hang"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
              {customer.name}
            </h1>
            <p className="text-xs text-slate-500">
              Đăng ký ngày: {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        <Button
          variant={customer.isActive ? 'destructive' : 'outline'}
          size="sm"
          onClick={handleToggleLock}
          className="gap-1.5"
        >
          {customer.isActive ? (
            <>
              <Lock className="h-4 w-4" />
              Khóa tài khoản
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Mở khóa tài khoản
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 1 Col: Profile & Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-luxury-gold/20 text-luxury-gold font-bold text-2xl border border-luxury-gold/30">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">{customer.name}</p>
                <span
                  className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-2xs font-semibold ${
                    customer.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {customer.isActive ? 'Hoạt động bình thường' : 'Tài khoản đang bị khóa'}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{customer.phone || 'Chưa cập nhật SĐT'}</span>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <p className="text-2xs font-bold uppercase text-slate-400">Tổng số đơn</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {customer.orders?.length || 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <p className="text-2xs font-bold uppercase text-slate-400">Tổng chi tiêu</p>
              <p className="mt-1 text-lg font-bold text-luxury-gold">
                {formatPrice(customer.totalSpent)}
              </p>
            </div>
          </div>

          {/* Addresses */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sổ địa chỉ ({customer.addresses?.length || 0})
            </h3>
            {customer.addresses?.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa lưu địa chỉ nào</p>
            ) : (
              customer.addresses?.map((addr: any) => (
                <div key={addr.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-900">{addr.fullName} • {addr.phone}</p>
                  <p className="mt-1 text-slate-600">
                    {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                  </p>
                  {addr.isDefault && (
                    <span className="mt-2 inline-block rounded bg-luxury-gold/20 px-1.5 py-0.5 text-2xs font-semibold text-luxury-gold">
                      Mặc định
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 2 Cols: Order history */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Lịch sử đơn hàng gần đây
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-3 font-semibold uppercase">Mã đơn</th>
                  <th className="pb-3 font-semibold uppercase">Ngày đặt</th>
                  <th className="pb-3 font-semibold uppercase">Tổng tiền</th>
                  <th className="pb-3 font-semibold uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customer.orders?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Khách hàng chưa có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  customer.orders?.map((order: any) => {
                    const statusMeta = ORDER_STATUSES[order.status] || {
                      label: order.status,
                      color: 'bg-slate-100 text-slate-700',
                    };

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-900">
                          <Link
                            href={`/admin/don-hang/${order.id}`}
                            className="hover:text-luxury-gold"
                          >
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 text-slate-500">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="py-3 font-semibold text-slate-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${statusMeta.color}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
