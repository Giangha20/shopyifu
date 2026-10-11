'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const ANNOUNCEMENTS = [
  {
    id: 1,
    text: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000₫',
    badge: 'FREESHIP',
    link: '/san-pham',
  },
  {
    id: 2,
    text: 'Đổi trả miễn phí trong 30 ngày tại nhà tiện lợi & chu đáo',
    badge: '30 NGÀY ĐỔI TRẢ',
    link: '/chinh-sach/doi-tra',
  },
  {
    id: 3,
    text: 'Đăng ký thành viên nhận ngay voucher giảm 10% đơn đầu tiên: LUXE10',
    badge: 'ƯU ĐÃI MỚI',
    link: '/dang-ky',
  },
];

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('luxe_announcement_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('luxe_announcement_dismissed', 'true');
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="relative bg-luxury-black text-white overflow-hidden border-b border-white/10 z-50 text-xs sm:text-sm select-none"
        >
          <div className="container-luxe mx-auto flex items-center justify-between py-2 sm:py-2.5 px-3 sm:px-6">
            {/* Left arrow for cycling on md+ */}
            <button
              onClick={handlePrev}
              aria-label="Thông báo trước"
              className="hidden md:flex items-center justify-center text-white/60 hover:text-luxury-gold transition-colors p-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Main content slider */}
            <div className="flex-1 flex items-center justify-center overflow-hidden min-h-[22px] px-2 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={ANNOUNCEMENTS[currentIndex].id}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -16, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="flex items-center gap-2 justify-center flex-wrap"
                >
                  <span className="inline-flex items-center gap-1 rounded bg-luxury-gold/20 text-luxury-gold px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase border border-luxury-gold/30">
                    <Sparkles className="w-3 h-3 text-luxury-gold shrink-0" />
                    {ANNOUNCEMENTS[currentIndex].badge}
                  </span>

                  <Link
                    href={ANNOUNCEMENTS[currentIndex].link}
                    className="hover:text-luxury-gold transition-colors font-medium text-white/90 truncate max-w-[280px] sm:max-w-xl md:max-w-2xl"
                  >
                    {ANNOUNCEMENTS[currentIndex].text}
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right arrow & close button */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleNext}
                aria-label="Thông báo tiếp theo"
                className="hidden md:flex items-center justify-center text-white/60 hover:text-luxury-gold transition-colors p-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDismiss}
                aria-label="Đóng thanh thông báo"
                className="flex items-center justify-center text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
