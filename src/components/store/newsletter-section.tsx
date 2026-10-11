'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setIsLoading(true);
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      toast.success('Chúc mừng! Bạn đã đăng ký thành công đặc quyền LUXE VIP.');
    }, 700);
  };

  return (
    <section className="py-20 sm:py-28 bg-luxury-cream/50 relative overflow-hidden">
      <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto bg-luxury-black text-white rounded-3xl p-8 sm:p-14 lg:p-16 shadow-2xl relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-luxury-gold/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
              <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-white/90">
                ĐẶC QUYỀN HỘI VIÊN LUXE VIP
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Gia Nhập Cộng Đồng{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold to-amber-200">
                Thượng Lưu
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed font-light">
              Đăng ký để nhận voucher chào mừng trị giá{' '}
              <strong className="text-luxury-gold font-semibold">200.000₫</strong>, lời mời tham dự các buổi ra mắt bộ sưu tập giới hạn độc quyền và quà tặng sinh nhật dành riêng cho bạn.
            </p>

            {/* Form */}
            <div className="mt-8 sm:mt-10">
              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-white">Đăng ký thành công!</p>
                    <p className="text-xs text-emerald-300">
                      Mã giảm giá <span className="font-bold text-luxury-gold">LUXEVIP200</span> đã sẵn sàng cho đơn hàng đầu tiên của bạn.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
                >
                  <div className="relative w-full">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn..."
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/40 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-gold w-full sm:w-auto py-4 px-8 rounded-xl font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-glow-lg whitespace-nowrap transition-all"
                  >
                    {isLoading ? 'Đang gửi...' : 'Đăng ký ngay'}
                  </button>
                </form>
              )}
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-luxury-gold" />
              <span>Chúng tôi tôn trọng quyền riêng tư. Không gửi thư rác.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
