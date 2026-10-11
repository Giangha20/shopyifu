'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, ShieldCheck, Check, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { resetPasswordSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';

  const reqLength = passwordValue.length >= 8;
  const reqUpper = /[A-Z]/.test(passwordValue);
  const reqLower = /[a-z]/.test(passwordValue);
  const reqNumber = /[0-9]/.test(passwordValue);
  const reqSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  const passedCount = [reqLength, reqUpper, reqLower, reqNumber, reqSpecial].filter(Boolean).length;
  const strengthPercentage = (passedCount / 5) * 100;

  const getStrengthLabel = () => {
    if (!passwordValue) return '';
    if (passedCount <= 2) return { text: 'Yếu', color: 'text-rose-400', bg: 'bg-rose-500' };
    if (passedCount <= 3) return { text: 'Trung bình', color: 'text-amber-400', bg: 'bg-amber-500' };
    if (passedCount <= 4) return { text: 'Tốt', color: 'text-blue-400', bg: 'bg-blue-500' };
    return { text: 'Rất an toàn', color: 'text-emerald-400', bg: 'bg-emerald-500' };
  };

  const strength = getStrengthLabel();

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setServerError('Mã khôi phục không tồn tại hoặc không hợp lệ.');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setServerError('Mật khẩu xác nhận không khớp');
      return;
    }

    setServerError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setServerError(resData.error || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
        return;
      }

      setIsSuccess(true);
    } catch {
      setServerError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-white">Liên kết không hợp lệ</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Đường dẫn đặt lại mật khẩu bị thiếu token hoặc đã hết hạn sử dụng. Vui lòng gửi lại yêu cầu mới.
        </p>
        <div className="pt-2">
          <Link href="/quen-mat-khau">
            <Button variant="gold" size="md" className="text-slate-950 font-medium">
              Yêu cầu đặt lại mật khẩu mới
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-white">Đặt lại mật khẩu thành công!</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Mật khẩu mới của bạn đã được cập nhật thành công. Quý khách vui lòng đăng nhập bằng mật khẩu mới để tiếp tục.
        </p>
        <div className="pt-2">
          <Link href="/dang-nhap">
            <Button variant="gold" size="lg" className="w-full text-slate-950 font-semibold uppercase text-xs">
              Đăng nhập ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
          Đặt lại mật khẩu mới
        </h2>
        <p className="text-xs text-slate-400">
          Vui lòng thiết lập mật khẩu bảo mật mới cho tài khoản của bạn
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Mật khẩu mới <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Vui lòng nhập mật khẩu',
                minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
              })}
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {passwordValue && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-2xs">
                <span className="text-slate-400">Độ mạnh mật khẩu:</span>
                <span className={`font-semibold ${strength ? strength.color : ''}`}>
                  {strength ? strength.text : ''}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength ? strength.bg : ''}`}
                  style={{ width: `${strengthPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="mt-2 grid grid-cols-2 gap-1 text-2xs text-slate-400">
            <div className={`flex items-center gap-1 ${reqLength ? 'text-emerald-400' : ''}`}>
              <Check className={`h-3 w-3 ${reqLength ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>Tối thiểu 8 ký tự</span>
            </div>
            <div className={`flex items-center gap-1 ${reqUpper ? 'text-emerald-400' : ''}`}>
              <Check className={`h-3 w-3 ${reqUpper ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>1 chữ in hoa</span>
            </div>
            <div className={`flex items-center gap-1 ${reqLower ? 'text-emerald-400' : ''}`}>
              <Check className={`h-3 w-3 ${reqLower ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>1 chữ thường</span>
            </div>
            <div className={`flex items-center gap-1 ${reqNumber ? 'text-emerald-400' : ''}`}>
              <Check className={`h-3 w-3 ${reqNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>1 chữ số</span>
            </div>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Xác nhận mật khẩu mới <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Vui lòng xác nhận mật khẩu',
              })}
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full text-slate-950 font-semibold tracking-wide uppercase text-xs"
          isLoading={isSubmitting}
          loadingText="Đang cập nhật..."
        >
          Cập nhật mật khẩu mới
        </Button>
      </form>

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
