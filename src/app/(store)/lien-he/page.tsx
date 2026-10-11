'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Instagram,
  Facebook,
  Youtube,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { toast } from '@/components/ui/toast';
import { useStoreSettings } from '@/hooks/use-settings';

const contactSchema = z.object({
  name: z.string().min(2, 'Vui lòng nhập họ và tên của bạn'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  phone: z
    .string()
    .min(9, 'Số điện thoại không hợp lệ')
    .regex(/^(0[1-9])\d{8,9}$/, 'Số điện thoại không đúng định dạng'),
  subject: z.string().min(3, 'Vui lòng nhập chủ đề liên hệ'),
  message: z.string().min(10, 'Nội dung tin nhắn cần tối thiểu 10 ký tự'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { settings, fetchSettings, isLoaded } = useStoreSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  React.useEffect(() => {
    if (!isLoaded) {
      fetchSettings();
    }
  }, [isLoaded, fetchSettings]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulating API ticket creation
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSent(true);
    toast.success('Tin nhắn của bạn đã được gửi thành công!', {
      description: 'Chuyên viên chăm sóc khách hàng LUXE sẽ liên hệ lại trong vòng 2 giờ.',
    });
    reset();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-luxe pt-4">
        <Breadcrumbs items={[{ label: 'Liên hệ' }]} />

        <div className="mt-2 mb-12 text-center max-w-2xl mx-auto">
          <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
            KẾT NỐI VỚI CHÚNG TÔI
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-luxury-black tracking-tight">
            Liên Hệ {settings.storeName || 'LUXE SHOP'}
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed">
            {settings.storeSlogan ||
              'Chúng tôi luôn sẵn sàng lắng nghe mọi yêu cầu đặt may riêng, tư vấn kích cỡ hoặc hỗ trợ sau bán hàng từ quý khách.'}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-luxury-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-luxury-gold mb-4 shadow-glow">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
                Địa Chỉ Cửa Hàng
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {settings.contactAddress || 'Toà nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-luxury-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-luxury-gold mb-4 shadow-glow">
                <Phone className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
                Hotline Liên Hệ
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                <a
                  href={`tel:${settings.contactPhone?.replace(/\s+/g, '') || '19008888'}`}
                  className="font-semibold text-slate-900 hover:text-luxury-gold transition-colors block"
                >
                  {settings.contactPhone || '1900 8888'}
                </a>
                <span>Hỗ trợ tư vấn 24/7</span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-luxury-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-luxury-gold mb-4 shadow-glow">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
                Thư Điện Tử
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                <a
                  href={`mailto:${settings.contactEmail || 'contact@luxeshop.vn'}`}
                  className="font-semibold text-slate-900 hover:text-luxury-gold transition-colors block break-all"
                >
                  {settings.contactEmail || 'contact@luxeshop.vn'}
                </a>
                <span>Phản hồi trong 2 giờ làm việc</span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-luxury-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-luxury-gold mb-4 shadow-glow">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-900 mb-1">
                Giờ Mở Cửa
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {settings.businessHours || '08:30 - 21:30 hàng ngày'}<br />
                (Phục vụ phòng thử VIP riêng)
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid: Form + Map Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
              <MessageSquare className="h-5 w-5 text-luxury-gold" />
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Gửi Tin Nhắn Cho {settings.storeName || 'LUXE'}
              </h3>
            </div>

            {isSent ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-xl font-bold text-slate-900">
                  Cảm ơn quý khách đã gửi tin nhắn!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Chuyên viên thời trang cao cấp của LUXE sẽ sớm liên hệ lại với quý khách qua số điện thoại hoặc email đã cung cấp.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="rounded-xl bg-luxury-black px-6 py-2.5 text-xs font-semibold text-white"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Lan Anh"
                      {...register('name')}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm transition-all focus:outline-none ${
                        errors.name ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                      }`}
                    />
                    {errors.name && <p className="text-2xs text-rose-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      {...register('phone')}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm transition-all focus:outline-none ${
                        errors.phone ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                      }`}
                    />
                    {errors.phone && <p className="text-2xs text-rose-500">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Địa chỉ Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="lananh@gmail.com"
                      {...register('email')}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm transition-all focus:outline-none ${
                        errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                      }`}
                    />
                    {errors.email && <p className="text-2xs text-rose-500">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Chủ đề liên hệ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Tư vấn may đo dạ tiệc / Đổi trả"
                      {...register('subject')}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm transition-all focus:outline-none ${
                        errors.subject ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                      }`}
                    />
                    {errors.subject && <p className="text-2xs text-rose-500">{errors.subject.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nội dung tin nhắn <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả chi tiết câu hỏi hoặc yêu cầu kích cỡ của quý khách..."
                    {...register('message')}
                    className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none ${
                      errors.message ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                    }`}
                  />
                  {errors.message && <p className="text-2xs text-rose-500">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-luxury-black px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-luxury-lg hover:bg-luxury-black-light transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Đang gửi tin nhắn...' : 'Gửi liên hệ ngay'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Map & Social Links */}
          <div className="lg:col-span-5 space-y-6">
            {/* Interactive Map Visual Placeholder */}
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-slate-900 mb-3">
                Bản Đồ Chỉ Đường
              </h3>
              <div className="relative aspect-[4/3] w-full rounded-2xl bg-slate-100 overflow-hidden border border-gray-200 flex flex-col items-center justify-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-luxury-black text-white flex items-center justify-center shadow-lg mb-2">
                  <MapPin className="h-6 w-6 text-luxury-gold" />
                </div>
                <h4 className="font-serif text-sm font-bold text-slate-900">
                  LUXE Flagship Tràng Tiền
                </h4>
                <p className="text-2xs text-slate-500 mt-1 max-w-xs">
                  24 Hai Bà Trưng, Phường Tràng Tiền, Hoàn Kiếm, Hà Nội
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 rounded-xl bg-luxury-black px-4 py-2 text-2xs font-bold uppercase tracking-wider text-white hover:bg-luxury-black-light"
                >
                  Mở trên Google Maps
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-base font-bold text-slate-900 mb-2">
                Theo Dõi Chúng Tôi
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Cập nhật các buổi trình diễn bộ sưu tập giới hạn và xu hướng mới nhất trên mạng xã hội.
              </p>
              <div className="flex gap-3">
                <a
                  href={settings.facebookUrl || 'https://facebook.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-slate-700 hover:border-luxury-gold hover:text-luxury-gold hover:bg-brand-50/50 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href={settings.instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-slate-700 hover:border-luxury-gold hover:text-luxury-gold hover:bg-brand-50/50 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-slate-700 hover:border-luxury-gold hover:text-luxury-gold hover:bg-brand-50/50 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
