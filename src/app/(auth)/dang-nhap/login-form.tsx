'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { loginSchema, type LoginInput } from '@/lib/validations';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showGoogleTooltip, setShowGoogleTooltip] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const result = await login(data.email, data.password, rememberMe);
      if (!result.success) {
        setServerError(result.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        return;
      }
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setServerError('Đã có lỗi xảy ra trong quá trình kết nối. Vui lòng thử lại.');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
          Đăng nhập tài khoản
        </h2>
        <p className="text-xs text-slate-400">
          Chào mừng quý khách trở lại với thế giới của LUXE SHOP
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
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Email <span className="text-rose-400">*</span>
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Mật khẩu <span className="text-rose-400">*</span>
            </label>
            <Link
              href="/quen-mat-khau"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0"
            />
            <span>Ghi nhớ đăng nhập trên thiết bị này</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full text-slate-950 font-semibold tracking-wide uppercase text-xs"
          isLoading={isSubmitting}
          loadingText="Đang xác thực..."
        >
          Đăng nhập
        </Button>
      </form>

      {/* Social login divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-2xs uppercase">
          <span className="bg-slate-900 px-3 text-slate-500">Hoặc tiếp tục với</span>
        </div>
      </div>

      {/* Google login button */}
      <div className="relative">
        <button
          type="button"
          onMouseEnter={() => setShowGoogleTooltip(true)}
          onMouseLeave={() => setShowGoogleTooltip(false)}
          className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-slate-700 bg-slate-800/50 px-4 text-xs font-medium text-slate-300 opacity-70 cursor-not-allowed transition-all"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>

        {showGoogleTooltip && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-slate-800 border border-slate-700 px-2.5 py-1 text-2xs text-slate-300 shadow-lg whitespace-nowrap z-20">
            Tính năng Google OAuth đang được cấu hình
          </div>
        )}
      </div>

      {/* Switch to Register */}
      <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span>Chưa có tài khoản thành viên? </span>
        <Link
          href="/dang-ky"
          className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
