'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUp,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Youtube,
  ShieldCheck,
  CreditCard,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStoreSettings } from '@/hooks/use-settings';

export function Footer() {
  const { settings, fetchSettings, isLoaded } = useStoreSettings();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!isLoaded) {
      fetchSettings();
    }
  }, [isLoaded, fetchSettings]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setIsSubscribed(true);
    toast.success('Cảm ơn bạn đã đăng ký nhận bản tin từ LUXE SHOP!');
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-luxury-black text-white pt-16 pb-24 md:pb-12 border-t border-white/10 relative">
      {/* Top Newsletter Highlight Banner inside footer */}
      <div className="container-luxe mx-auto pb-12 mb-12 border-b border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 bg-gradient-to-r from-white/5 to-white/[0.02] p-8 rounded-2xl border border-white/10">
          <div className="max-w-xl">
            <span className="text-luxury-gold uppercase tracking-[0.25em] text-xs font-semibold">
              LUXE PRIVILEGE CLUB
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-2 text-white">
              Nhận ngay ưu đãi 10% cho đơn hàng đầu tiên
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Đăng ký để nhận thông tin sớm nhất về các bộ sưu tập giới hạn, sự kiện thời trang độc quyền và các đặc quyền VIP.
            </p>
          </div>

          {/* Form */}
          <div className="w-full lg:max-w-md">
            {isSubscribed ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Bạn đã gia nhập thành công LUXE Privilege Club!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn..."
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-gold py-3 px-6 rounded-xl font-semibold text-xs tracking-wider uppercase inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Đăng ký</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main 4-Column Grid */}
      <div className="container-luxe mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          {/* Column 1: Brand Info (takes 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-black tracking-widest text-white">
                {settings.storeName || 'LUXE'}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold">
                {settings.storeSlogan ? 'Haute Couture' : 'Haute Couture'}
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.storeSlogan ||
                'LUXE SHOP là biểu tượng thời trang cao cấp hàng đầu Việt Nam, mang đến những thiết kế tinh hoa, chất liệu thượng hạng và trải nghiệm mua sắm xa xỉ chuẩn mực quốc tế.'}
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                <span>{settings.contactAddress || 'Toà nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-luxury-gold shrink-0" />
                <a
                  href={`tel:${settings.contactPhone?.replace(/\s+/g, '') || '19008888'}`}
                  className="hover:text-luxury-gold transition-colors"
                >
                  Hotline: {settings.contactPhone || '1900 8888'} ({settings.businessHours || '08:30 - 22:00'})
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-luxury-gold shrink-0" />
                <a
                  href={`mailto:${settings.contactEmail || 'contact@luxeshop.vn'}`}
                  className="hover:text-luxury-gold transition-colors"
                >
                  {settings.contactEmail || 'contact@luxeshop.vn'}
                </a>
              </div>
            </div>

            {/* Social media icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.facebookUrl || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-luxury-gold transition-colors"
                aria-label="Facebook LUXE SHOP"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-luxury-gold transition-colors"
                aria-label="Instagram LUXE SHOP"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-luxury-gold transition-colors"
                aria-label="YouTube LUXE SHOP"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={settings.tiktokUrl || 'https://tiktok.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-luxury-gold transition-colors font-bold text-xs"
                aria-label="TikTok LUXE SHOP"
              >
                TT
              </a>
            </div>
          </div>

          {/* Column 2: Về LUXE SHOP */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-white tracking-wide uppercase">
              Về LUXE SHOP
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/gioi-thieu" className="hover:text-luxury-gold transition-colors">
                  Câu chuyện thương hiệu
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-luxury-gold transition-colors">
                  Bộ sưu tập độc quyền
                </Link>
              </li>
              <li>
                <Link href="/bai-viet" className="hover:text-luxury-gold transition-colors">
                  Tạp chí phong cách & Xu hướng
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-luxury-gold transition-colors">
                  Tuyển dụng nhân tài
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-luxury-gold transition-colors">
                  Hệ thống Boutique
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hỗ trợ khách hàng */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-white tracking-wide uppercase">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/cau-hoi-thuong-gap" className="hover:text-luxury-gold transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/van-chuyen" className="hover:text-luxury-gold transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/doi-tra" className="hover:text-luxury-gold transition-colors">
                  Đổi trả & Hoàn tiền trong 30 ngày
                </Link>
              </li>
              <li>
                <Link href="/tra-cuu-don-hang" className="hover:text-luxury-gold transition-colors">
                  Tra cứu hành trình đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-luxury-gold transition-colors">
                  Trung tâm trợ giúp & CSKH
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Chính sách */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-white tracking-wide uppercase">
              Chính Sách & Bảo Mật
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/chinh-sach/bao-mat" className="hover:text-luxury-gold transition-colors">
                  Chính sách bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/dieu-khoan" className="hover:text-luxury-gold transition-colors">
                  Điều khoản sử dụng dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/thanh-toan" className="hover:text-luxury-gold transition-colors">
                  Chính sách thanh toán
                </Link>
              </li>
              <li>
                <Link href="/tai-khoan" className="hover:text-luxury-gold transition-colors">
                  Quy chế hội viên LUXE Club
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="hover:text-luxury-gold transition-colors flex items-center gap-1.5 text-luxury-gold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cam kết chính hãng 100%</span>
                </Link>
              </li>
            </ul>

          </div>
        </div>

        {/* Bottom Bar: Payment icons, copyright, Back to top */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          {/* Payment Methods */}
          <div className="flex items-center flex-wrap gap-2 text-slate-400">
            <span className="text-[11px] font-medium mr-2">Phương thức thanh toán:</span>
            <span className="px-2.5 py-1 bg-white/10 rounded font-semibold text-[11px] text-white">
              VISA
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded font-semibold text-[11px] text-white">
              MasterCard
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded font-semibold text-[11px] text-sky-400">
              VNPay
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded font-semibold text-[11px] text-pink-400">
              MoMo
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded font-semibold text-[11px] text-amber-400">
              COD
            </span>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-left">
            <p>© {currentYear} {settings.storeName || 'LUXE SHOP'}. Bảo lưu mọi quyền.</p>
          </div>

          {/* Back to top button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-luxury-gold transition-all text-xs"
            aria-label="Về đầu trang"
          >
            <span>Đầu trang</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
