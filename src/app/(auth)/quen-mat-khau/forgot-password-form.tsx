'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { forgotPasswordSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';

interface FormData {
  email: string;
}

export default function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setServerError(resData.error || 'Có lỗi xảy ra, vui lòng thử lại');
        return;
      }

      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch {
      setServerError('Lỗi kết nối máy chủ, vui lòng thử lại.');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
          Quên mật khẩu?
        </h2>
        <p className="text-xs text-slate-400">
          Nhập địa chỉ email liên kết với tài khoản của bạn để nhận liên kết khôi phục
        </p>
      </div>

      <AnimatePresence mode="wait">
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-white">Kiểm tra hộp thư đến</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
              <span className="font-medium text-amber-400">{submittedEmail}</span>. Vui lòng kiểm tra email của bạn (bao gồm cả thư mục Spam/Rác).
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              className="w-full border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={() => setIsSuccess(false)}
            >
              Gửi lại email khác
            </Button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Địa chỉ Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                autoComplete="email"
                placeholder="example@domain.com"
                {...register('email')}
                className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 pl-10 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full text-slate-950 font-semibold tracking-wide uppercase text-xs"
            isLoading={isSubmitting}
            loadingText="Đang gửi liên kết..."
          >
            Gửi liên kết khôi phục
          </Button>
        </form>
      )}

      {/* Back to login */}
      <div className="text-center pt-2 border-t border-slate-800">
        <Link
          href="/dang-nhap"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại trang Đăng nhập</span>
        </Link>
      </div>
    </div>
  );
}
