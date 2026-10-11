'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddStaffPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await fetch('/api/admin/staff');
        if (res.ok) {
          const data = await res.json();
          setRoles(data.roles || []);
          if (data.roles?.length > 0) setRoleId(data.roles[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          roleId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Có lỗi xảy ra');
        return;
      }

      router.push('/admin/nhan-vien');
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
          href="/admin/nhan-vien"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Thêm Nhân Viên Mới
          </h1>
          <p className="text-xs text-slate-500">Tạo tài khoản quản lý và cấp quyền truy cập hệ thống.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Họ đệm *</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nguyễn Văn"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Tên *</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="An"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Email đăng nhập *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="an.nguyen@luxeshop.vn"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-700">Mật khẩu khởi tạo *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-700">Vai trò quản trị *</label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.displayName || r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link href="/admin/nhan-vien">
          <Button type="button" variant="outline">Hủy bỏ</Button>
        </Link>
        <Button type="submit" disabled={loading} className="bg-luxury-black text-white hover:bg-luxury-black-light">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu tài khoản nhân viên
        </Button>
      </div>
    </form>
  );
}
