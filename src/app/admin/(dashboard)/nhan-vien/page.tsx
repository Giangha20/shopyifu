'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, Shield, Lock, Unlock, Mail, Phone, Calendar } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
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
      header: 'Nhân viên',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-luxury-black text-white font-semibold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="text-2xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Vai trò / Phân quyền',
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Nhân Viên & Phân Quyền
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Danh sách quản trị viên, nhân viên bán hàng và hỗ trợ khách hàng.
          </p>
        </div>

        <Link href="/admin/nhan-vien/them">
          <Button className="bg-luxury-black text-white hover:bg-luxury-black-light shadow-sm">
            <UserPlus className="mr-1.5 h-4 w-4" />
            Thêm nhân viên mới
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={staff} isLoading={loading} />
    </div>
  );
}
