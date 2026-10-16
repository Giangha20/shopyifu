'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Shield,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Trash2,
  Key,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editUser, setEditUser] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    isActive: true,
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openEditModal = (user: any) => {
    setEditUser(user);
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone === '—' ? '' : user.phone || '',
      password: '',
      roleId: user.roleIds?.[0] || '',
      isActive: user.isActive,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsEditOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch('/api/admin/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUser.id,
          ...form,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật');

      setSuccessMsg('Cập nhật tài khoản thành công!');
      fetchStaff();
      setTimeout(() => {
        setIsEditOpen(false);
        setSuccessMsg('');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id: string, email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${email}"?`)) return;

    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể xóa');
      alert(data.message || 'Đã xóa');
      fetchStaff();
      if (isEditOpen) setIsEditOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current }),
      });
      if (res.ok) fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Nhân viên / Admin',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-luxury-black text-white font-semibold text-xs border border-luxury-gold/40">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="text-2xs text-slate-400">{row.email}</p>
            {row.phone && row.phone !== '—' && (
              <p className="text-2xs text-slate-500 font-mono">SĐT: {row.phone}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Vai trò / Quyền',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((r: string, idx: number) => (
            <span
              key={idx}
              className="rounded-full bg-amber-50 px-2.5 py-0.5 text-2xs font-semibold text-amber-800 border border-amber-200"
            >
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Đăng nhập cuối',
      cell: (row) => (
        <span className="text-2xs text-slate-500">
          {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : 'Chưa đăng nhập'}
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
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-semibold text-emerald-700">
              <Unlock className="h-3 w-3" /> Hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-2xs font-semibold text-rose-700">
              <Lock className="h-3 w-3" /> Đã khóa
            </span>
          )}
        </button>
      ),
    },
    {
      header: 'Hành động',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
            className="h-8 gap-1 px-2.5 text-xs text-slate-700 hover:border-luxury-gold hover:text-luxury-gold"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Sửa
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteStaff(row.id, row.email)}
            className="h-8 px-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
            title="Xóa tài khoản"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Quản Trị Viên & Nhân Viên
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Chỉ quản trị viên cấp cao mới có quyền thêm, đổi mật khẩu và sửa đổi thông tin các tài khoản này.
          </p>
        </div>

        <Link href="/admin/nhan-vien/them">
          <Button className="bg-luxury-black text-white hover:bg-slate-800 shadow-sm">
            <UserPlus className="mr-1.5 h-4 w-4" />
            Thêm nhân viên mới
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={staff} isLoading={loading} />

      {/* Edit Staff Modal */}
      {isEditOpen && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Chỉnh sửa tài khoản: {editUser.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Cập nhật quyền hạn, email, số điện thoại hoặc cấp lại mật khẩu mới.
                </p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="mt-4 space-y-4">
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
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                    placeholder="Nguyễn"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Tên</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                    placeholder="Văn A"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email đăng nhập</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  placeholder="0901234567"
                />
              </div>

              {roles.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phân quyền (Role)</label>
                  <select
                    value={form.roleId}
                    onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  >
                    <option value="">-- Chọn vai trò --</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.displayName || r.name} ({r.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Key className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Đổi mật khẩu mới (Tùy chọn)</span>
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  placeholder="Để trống nếu giữ nguyên mật khẩu cũ"
                />
                <p className="text-2xs text-slate-400">
                  Tối thiểu 6 ký tự. Điền mật khẩu mới nếu muốn đổi.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="staffIsActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-luxury-black focus:ring-luxury-gold"
                />
                <label htmlFor="staffIsActive" className="text-xs font-medium text-slate-700">
                  Tài khoản đang kích hoạt (có thể đăng nhập)
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
