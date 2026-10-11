'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { changePasswordSchema, type LoginInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword') || '';

  const reqLength = newPasswordValue.length >= 8;
  const reqUpper = /[A-Z]/.test(newPasswordValue);
  const reqLower = /[a-z]/.test(newPasswordValue);
  const reqNumber = /[0-9]/.test(newPasswordValue);
  const reqSpecial = /[^A-Za-z0-9]/.test(newPasswordValue);

  const passedCount = [reqLength, reqUpper, reqLower, reqNumber, reqSpecial].filter(Boolean).length;
  const strengthPercentage = (passedCount / 5) * 100;

  const getStrengthLabel = () => {
    if (!newPasswordValue) return '';
    if (passedCount <= 2) return { text: 'Yếu', color: 'text-rose-500', bg: 'bg-rose-500' };
    if (passedCount <= 3) return { text: 'Trung bình', color: 'text-amber-500', bg: 'bg-amber-500' };
    if (passedCount <= 4) return { text: 'Tốt', color: 'text-blue-500', bg: 'bg-blue-500' };
    return { text: 'Rất an toàn', color: 'text-emerald-500', bg: 'bg-emerald-500' };
  };

  const strength = getStrengthLabel();

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        setErrorMessage(resData.error || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
        return;
      }

      setSuccessMessage('Đổi mật khẩu thành công! Mật khẩu mới đã được kích hoạt.');
      reset();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setErrorMessage('Đã có lỗi xảy ra trong quá trình cập nhật. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-serif text-2xl font-bold text-luxury-black">
          Đổi mật khẩu tài khoản
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Bảo vệ tài khoản của bạn bằng mật khẩu mạnh bao gồm chữ in hoa, chữ thường và chữ số
        </p>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 text-xs font-medium text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50 p-4 text-xs font-medium text-rose-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Mật khẩu hiện tại <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('currentPassword')}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-rose-500">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('newPassword')}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength meter */}
          {newPasswordValue && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-2xs">
                <span className="text-slate-500">Độ an toàn:</span>
                <span className={`font-semibold ${strength ? strength.color : ''}`}>
                  {strength ? strength.text : ''}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength ? strength.bg : ''}`}
                  style={{ width: `${strengthPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-2xs text-slate-500">
            <div className={`flex items-center gap-1 ${reqLength ? 'text-emerald-600 font-medium' : ''}`}>
              <Check className={`h-3 w-3 ${reqLength ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Tối thiểu 8 ký tự</span>
            </div>
            <div className={`flex items-center gap-1 ${reqUpper ? 'text-emerald-600 font-medium' : ''}`}>
              <Check className={`h-3 w-3 ${reqUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Ít nhất 1 chữ hoa (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1 ${reqLower ? 'text-emerald-600 font-medium' : ''}`}>
              <Check className={`h-3 w-3 ${reqLower ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Ít nhất 1 chữ thường (a-z)</span>
            </div>
            <div className={`flex items-center gap-1 ${reqNumber ? 'text-emerald-600 font-medium' : ''}`}>
              <Check className={`h-3 w-3 ${reqNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Ít nhất 1 số (0-9)</span>
            </div>
          </div>

          {errors.newPassword && (
            <p className="mt-1 text-xs text-rose-500">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmNewPassword')}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="mt-1 text-xs text-rose-500">{errors.confirmNewPassword.message}</p>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Đang cập nhật..."
            className="min-w-[180px] bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs uppercase tracking-wider"
          >
            Lưu mật khẩu mới
          </Button>
        </div>
      </form>
    </div>
  );
}
