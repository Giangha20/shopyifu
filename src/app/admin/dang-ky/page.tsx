'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, Key, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    secretKey: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Mật khẩu quản trị viên phải từ 6 ký tự trở lên');
      return;
    }

    if (!formData.secretKey) {
      setErrorMessage('Vui lòng nhập Mã Bí Mật Quản Trị (Admin Secret Key)');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Đăng ký quản trị viên thất bại');
        return;
      }

      toast.success('Đăng ký tài khoản Quản Trị Viên thành công!');
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-luxury-black via-slate-950 to-neutral-900 px-4 py-12 text-slate-100 selection:bg-luxury-gold selection:text-white">
      {/* Background aura */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-luxury-gold/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="rounded-2xl border border-white/10 bg-luxury-black-light/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-luxury-gold to-amber-300 text-luxury-black shadow-glow">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
              ĐĂNG KÝ QUẢN TRỊ VIÊN
            </h1>
            <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">
              Cấp Quyền Vận Hành Hệ Thống LUXE SHOP
            </p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và tên */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-2xs font-semibold uppercase tracking-wider text-slate-300">
                  Họ & Tên đệm
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="Nguyễn Văn"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-luxury-gold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-2xs font-semibold uppercase tracking-wider text-slate-300">
                  Tên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="An"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-2xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Quản trị <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-2xs font-semibold uppercase tracking-wider text-slate-300">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mật khẩu & Xác nhận */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-2xs font-semibold uppercase tracking-wider text-slate-300">
                  Mật khẩu <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-2xs font-semibold uppercase tracking-wider text-slate-300">
                  Xác nhận mật khẩu <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mã xác thực Secret Key */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-2xs font-semibold uppercase tracking-wider text-amber-300">
                  Mã Bí Mật Quản Trị (Admin Secret Key) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Mặc định: YIFU@ADMIN2026</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400" />
                <input
                  type="text"
                  name="secretKey"
                  required
                  placeholder="Nhập mã bí mật được cấp bởi chủ shop..."
                  value={formData.secretKey}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-amber-500/40 bg-black/40 pl-9 pr-3 py-2.5 text-xs text-amber-200 placeholder-slate-500 font-mono focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 h-11 rounded-xl bg-gradient-to-r from-luxury-gold to-amber-500 text-luxury-black font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-glow"
            >
              {isSubmitting ? 'Đang kích hoạt tài khoản...' : 'Kích Hoạt Tài Khoản Quản Trị'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Đã có tài khoản quản trị?{' '}
            <Link href="/admin/login" className="font-semibold text-luxury-gold hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
