'use client';

import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RotateCcw, Lock } from 'lucide-react';

const BADGES = [
  {
    icon: Truck,
    title: 'Giao Hàng Miễn Phí',
    description: 'Áp dụng cho mọi đơn hàng từ 500.000₫ toàn quốc. Đóng gói hộp quà cao cấp.',
  },
  {
    icon: ShieldCheck,
    title: '100% Chính Hãng',
    description: 'Cam kết nguồn gốc xuất xứ rõ ràng, bảo hành chất lượng thượng hạng.',
  },
  {
    icon: RotateCcw,
    title: 'Đổi Trả 30 Ngày',
    description: 'Thủ tục đổi trả tận nơi thuận tiện, hoàn tiền nhanh chóng nếu không hài lòng.',
  },
  {
    icon: Lock,
    title: 'Thanh Toán An Toàn',
    description: 'Bảo mật tiêu chuẩn quốc tế PCI-DSS qua thẻ, cổng VNPay & ví điện tử.',
  },
];

interface TrustBadgesProps {
  className?: string;
}

export function TrustBadges({ className = '' }: TrustBadgesProps) {
  return (
    <section className={`border-y border-gray-100 bg-slate-50/70 py-8 sm:py-14 ${className}`}>
      <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* 2 dòng ngang, mỗi dòng 2 mục */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {BADGES.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2.5 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-luxury-gold/50 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-luxury-cream flex items-center justify-center shrink-0 border border-luxury-gold/25 shadow-xs">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-luxury-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-xs sm:text-lg font-bold text-luxury-black tracking-tight">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] sm:text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {badge.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
