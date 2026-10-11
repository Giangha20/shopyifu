'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Edit3,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate, formatDateTime, ORDER_STATUSES } from '@/lib/utils';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setCustomer(data.customer);
      setEditForm({
        firstName: data.customer.firstName || '',
        lastName: data.customer.lastName || '',
        email: data.customer.email || '',
        phone: data.customer.phone || '',
        password: '',
        isActive: data.customer.isActive,
      });
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
        setEditForm((prev) => ({ ...prev, isActive: !customer.isActive }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setSuccessMsg('Cập nhật thông tin khách hàng thành công!');
      fetchCustomer();
      setTimeout(() => {
        setIsEditOpen(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa hoặc vô hiệu hóa tài khoản khách hàng này?')) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể xóa');
      alert(data.message || 'Đã xử lý tài khoản');
      router.push('/admin/khach-hang');
    } catch (err: any) {
      alert(err.message);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5 border-slate-200 hover:border-luxury-gold hover:text-luxury-gold"
          >
            <Edit3 className="h-4 w-4" />
            Sửa thông tin
          </Button>

          <Button
            variant={customer.isActive ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleLock}
            className="gap-1.5"
          >
            {customer.isActive ? (
              <>
                <Lock className="h-4 w-4 text-rose-500" />
                Khóa tài khoản
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 text-emerald-600" />
                Mở khóa tài khoản
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteCustomer}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            title="Xóa tài khoản"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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
                <span className="font-medium">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{customer.phone || 'Chưa cập nhật SĐT'}</span>
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

      {/* Edit Customer Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Chỉnh sửa tài khoản khách hàng
                </h3>
                <p className="text-xs text-slate-500">
                  Chỉ Quản trị viên (Admin) mới có quyền sửa đổi thông tin này.
                </p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Họ đệm</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                    placeholder="Nguyễn Văn"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tên</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                    placeholder="An"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email đăng nhập</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  placeholder="khachhang@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  placeholder="0987654321"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Key className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Đặt lại mật khẩu mới cho khách (Tùy chọn)</span>
                </div>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  placeholder="Để trống nếu không muốn đổi mật khẩu"
                />
                <p className="text-2xs text-slate-400">
                  Chỉ điền nếu muốn cấp mật khẩu mới cho khách. Tối thiểu 6 ký tự.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-luxury-black focus:ring-luxury-gold"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-slate-700">
                  Cho phép tài khoản hoạt động và đăng nhập vào website
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={saving}
                  className="bg-luxury-black text-white hover:bg-slate-800"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
