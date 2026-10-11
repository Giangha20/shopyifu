'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Camera,
  Mail,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  BellRing,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { profileSchema, type ProfileInput } from '@/lib/validations';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateProfile, setUser } = useAuth();

  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [newsletterSubscribed, setNewsletterSubscribed] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  // Populate form with user data once ready
  React.useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
      setAvatarPreview(user.avatar || null);
      setNewsletterSubscribed(Boolean(user.newsletterSubscribed));
    }
  }, [user, reset]);

  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState<boolean>(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Dung lượng ảnh đại diện không được vượt quá 5MB.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setErrorMessage(null);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMessage(resData.error || 'Tải ảnh đại diện thất bại.');
        return;
      }

      setAvatarPreview(resData.url);
      if (resData.user) {
        setUser(resData.user);
      }
      setSuccessMessage('Cập nhật ảnh đại diện thành công!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch {
      setErrorMessage('Lỗi khi tải ảnh đại diện lên máy chủ.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileInput) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        avatar: avatarPreview?.startsWith('blob:') ? (user?.avatar || undefined) : (avatarPreview || undefined),
        newsletterSubscribed,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Cập nhật thông tin thất bại');
        return;
      }

      setSuccessMessage('Thông tin tài khoản đã được lưu thành công.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setErrorMessage('Đã có lỗi xảy ra trong quá trình lưu thông tin.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-serif text-2xl font-bold text-luxury-black">
          Hồ sơ khách hàng
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý thông tin định danh và tùy chọn nhận bản tin thời trang độc quyền
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
          <div className="relative group">
            <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white shadow-md bg-slate-900 flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Ảnh đại diện"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-amber-400 font-serif text-2xl font-bold select-none">
                  {user ? getInitials(user.firstName, user.lastName) : 'LX'}
                </span>
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-luxury-black text-white shadow-md transition-transform hover:scale-110 hover:bg-amber-600 ${
                isUploadingAvatar ? 'opacity-70 pointer-events-none' : ''
              }`}
              title="Đổi ảnh đại diện"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingAvatar}
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Ảnh đại diện cá nhân
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hỗ trợ định dạng JPG, PNG hoặc WEBP. Kích thước tối đa 2MB.
            </p>
            <label
              htmlFor="avatar-upload"
              className="inline-block text-xs font-medium text-amber-600 hover:text-amber-700 cursor-pointer pt-1"
            >
              Tải ảnh lên từ máy tính
            </label>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Last name (Họ) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Họ đệm <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Nguyễn"
                {...register('firstName')}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-xs text-rose-500">{errors.firstName.message}</p>
            )}
          </div>

          {/* First name (Tên) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Tên gọi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Văn An"
              {...register('lastName')}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-rose-500">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email (Readonly) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Email tài khoản
              </label>
              <span className="text-2xs text-slate-400">(Không thể thay đổi)</span>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                readOnly
                disabled
                value={user?.email || ''}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-100/70 px-3.5 pl-10 text-sm text-slate-500 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Số điện thoại liên hệ
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                placeholder="0912345678"
                {...register('phone')}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Newsletter Subscription Toggle */}
        <div className="rounded-2xl border border-amber-200/50 bg-amber-50/40 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Bản tin Phong cách & Ưu đãi LUXE
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                Nhận thông báo độc quyền về các bộ sưu tập Haute Couture mới nhất, sự kiện VIP Private Sale và quà tặng sinh nhật dành riêng cho bạn.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={newsletterSubscribed}
                onChange={(e) => setNewsletterSubscribed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Đang lưu thông tin..."
            className="min-w-[160px] bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm"
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
