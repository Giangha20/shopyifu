'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const adminLoginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    try {
      setErrorMessage(null);
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Đăng nhập không thành công');
        return;
      }

      // Login successful, redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Đã xảy ra lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-luxury-black via-slate-950 to-neutral-900 px-4 py-12 text-slate-100 selection:bg-luxury-gold selection:text-white">
      {/* Background luxury aura */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-luxury-gold/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-luxury-black-light/70 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-luxury-gold to-amber-300 text-luxury-black shadow-glow">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
              LUXE SHOP ADMIN
            </h1>
            <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">
              Cổng Quản Trị Hệ Thống Cao Cấp
            </p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Quản trị
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="admin@luxeshop.vn"
                  {...register('email')}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold/20"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold/20"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-11 bg-luxury-gold text-luxury-black font-semibold hover:bg-luxury-gold-dark hover:text-white transition-all shadow-glow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập quản trị
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-8 border-t border-white/5 pt-4 text-center text-2xs text-slate-500">
            Khu vực giới hạn. Tất cả các phiên đăng nhập đều được lưu lại nhật ký bảo mật.
          </div>
        </div>
      </div>
    </div>
  );
}
