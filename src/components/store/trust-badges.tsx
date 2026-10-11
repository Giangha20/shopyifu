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

export function TrustBadges() {
  return (
    <section className="border-y border-gray-100 bg-slate-50/60 py-12 sm:py-16">
      <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {BADGES.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-luxury-cream flex items-center justify-center shrink-0 border border-luxury-gold/20">
                  <Icon className="w-6 h-6 text-luxury-gold" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-luxury-black">
                    {badge.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
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
