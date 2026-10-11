'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, User, Phone, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { registerSchema, type RegisterInput } from '@/lib/validations';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [termsError, setTermsError] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';

  // Password requirements calculation
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

  const onSubmit = async (data: RegisterInput) => {
    if (!acceptTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setServerError(null);

    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (!result.success) {
        setServerError(result.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
        return;
      }

      router.push('/tai-khoan');
      router.refresh();
    } catch {
      setServerError('Đã có lỗi xảy ra trong quá trình kết nối. Vui lòng thử lại.');
    }
  };

  const [regSettings, setRegSettings] = React.useState({
    heading: 'Tạo tài khoản LUXE VIP',
    subheading: 'Gia nhập đặc quyền mua sắm thượng lưu & nhận ưu đãi dành riêng cho bạn',
    welcomeVoucher: 'WELCOME10',
    welcomeDesc: 'Giảm ngay 10% cho đơn hàng đầu tiên',
    requirePhone: 'optional',
    termsText: '',
  });

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings || data.data || {};
        setRegSettings({
          heading: s.register_heading || 'Tạo tài khoản LUXE VIP',
          subheading: s.register_subheading || 'Gia nhập đặc quyền mua sắm thượng lưu & nhận ưu đãi dành riêng cho bạn',
          welcomeVoucher: s.register_welcome_voucher || 'WELCOME10',
          welcomeDesc: s.register_welcome_voucher_desc || 'Giảm ngay 10% cho đơn hàng đầu tiên',
          requirePhone: s.register_require_phone || 'optional',
          termsText: s.register_terms_text || '',
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
          {regSettings.heading}
        </h2>
        <p className="text-xs text-slate-400">
          {regSettings.subheading}
        </p>
      </div>

      {regSettings.welcomeVoucher && (
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 p-3 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-300">
            <span>🎁</span>
            <span>Ưu đãi thành viên: Mã <strong className="font-mono text-amber-200 underline">{regSettings.welcomeVoucher}</strong></span>
          </div>
          <p className="text-2xs text-amber-400/80 mt-0.5">{regSettings.welcomeDesc}</p>
        </div>
      )}

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
        {/* Name Fields Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Last name (Họ) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Họ <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Nguyễn"
                {...register('firstName')}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 pl-9 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-xs text-rose-400">{errors.firstName.message}</p>
            )}
          </div>

          {/* First name (Tên) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tên <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Văn An"
              {...register('lastName')}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-rose-400">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Email <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              autoComplete="email"
              placeholder="example@domain.com"
              {...register('email')}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 pl-9 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field (optional) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Số điện thoại <span className="text-2xs text-slate-400 normal-case">(Tùy chọn)</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              placeholder="0912345678"
              {...register('phone')}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 pl-9 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-rose-400">{errors.phone.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Mật khẩu <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password')}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 pl-9 pr-9 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password strength meter */}
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

          {/* Requirements checklist */}
          <div className="mt-2 grid grid-cols-2 gap-1 text-2xs text-slate-400">
            <div className={`flex items-center gap-1 ${reqLength ? 'text-emerald-400' : ''}`}>
              <Check className={`h-3 w-3 ${reqLength ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>Tối thiểu 8 ký tự</span>
            </div>
            <div className={`flex items-center gap-1 ${reqUpper ? 'text-emerald-400' : ''}`}>
              <Check className={`h-3 w-3 ${reqUpper ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>1 chữ in hoa (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1 ${reqLower ? 'text-emerald-400' : ''}`}>
              <Check className={`h-3 w-3 ${reqLower ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>1 chữ thường (a-z)</span>
            </div>
            <div className={`flex items-center gap-1 ${reqNumber ? 'text-emerald-400' : ''}`}>
              <Check className={`h-3 w-3 ${reqNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>1 chữ số (0-9)</span>
            </div>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Xác nhận mật khẩu <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 pl-9 pr-9 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms acceptance checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (e.target.checked) setTermsError(false);
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0"
            />
            <span className="leading-tight">
              {regSettings.termsText ? (
                regSettings.termsText
              ) : (
                <>
                  Tôi đồng ý với{' '}
                  <Link href="/dieu-khoan" className="text-amber-400 hover:underline">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link href="/chinh-sach-bao-mat" className="text-amber-400 hover:underline">
                    Chính sách bảo mật
                  </Link>{' '}
                  của LUXE SHOP.
                </>
              )}
            </span>
          </label>
          {termsError && (
            <p className="text-xs text-rose-400">Vui lòng đồng ý với điều khoản để tiếp tục</p>
          )}
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full text-slate-950 font-semibold tracking-wide uppercase text-xs"
          isLoading={isSubmitting}
          loadingText="Đang khởi tạo tài khoản..."
        >
          Đăng ký tài khoản
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span>Đã có tài khoản? </span>
        <Link
          href="/dang-nhap"
          className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
        >
          Đăng nhập tại đây
        </Link>
      </div>
    </div>
  );
}
