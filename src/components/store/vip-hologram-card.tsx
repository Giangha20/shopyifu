'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Crown,
  Sparkles,
  ShieldCheck,
  Scissors,
  Check,
  Copy,
  ArrowRight,
  Wifi,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card3D } from '@/components/ui/card-3d';

export function VIPHologramCardSection() {
  const [activated, setActivated] = useState(false);
  const [vipCodeCopied, setVipCodeCopied] = useState(false);

  const handleActivateVIP = () => {
    setActivated(true);
    toast.success('Chúc mừng quý khách đã mở khoá Đặc Quyền VIP Black Card! 👑');
  };

  const handleCopyVipCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('SHOP-VIP-BLACK');
      setVipCodeCopied(true);
      toast.success('Đã sao chép mã đặc quyền: SHOP-VIP-BLACK (Giảm 15% trọn đời)!');
      setTimeout(() => setVipCodeCopied(false), 3000);
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-[#0B0B0C] relative overflow-hidden text-white border-y border-luxury-gold/20">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-luxury-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Copywriting */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold text-xs font-semibold uppercase tracking-[0.25em]">
              <Crown className="w-3.5 h-3.5" />
              <span>CÂU LẠC BỘ THƯỢNG LƯU &bull; PRIVILEGE CLUB</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Thẻ Đen Quyền Lực{' '}
              <span className="text-gold-gradient block sm:inline">
                SHOP QUAN AO VIP Black Card
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Không chỉ là thời trang, đây là tấm vé thông hành bước vào thế giới dịch vụ thượng khách chuẩn Concierge quốc tế. Tận hưởng sự riêng tư tuyệt đối, các bộ sưu tập giới hạn trước khi mở bán và phục vụ may đo chuẩn mực ngay tại tư dinh của bạn.
            </p>

            {/* 3 VIP Privileges */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-luxury-gold/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-luxury-gold/20 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shrink-0">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base">
                    Stylist & May Đo Tận Nơi (Private In-Home Fitting)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Chuyên gia định hình phong cách mang trang phục dạ hội và dụng cụ may đo đến tận khách sạn hoặc tư gia của bạn.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-luxury-gold/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-luxury-gold/20 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base">
                    Miễn Cọc Thuê Đồ & Giặt Hấp Vô Trùng Trọn Đời
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Đặc quyền nhận trang phục dạ hội không cần tiền ký quỹ bảo lãnh. Trang phục hoàn trả được phục hồi sợi vải tự động.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-luxury-gold/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-luxury-gold/20 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base">
                    Chiết Khấu Độc Quyền 15% Cho Mọi Dịch Vụ
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Áp dụng cộng dồn cho cả mua sắm thiết kế mới và dịch vụ thuê đầm sự kiện cao cấp.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleActivateVIP}
                className="btn-gold px-8 py-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase inline-flex items-center gap-2 shadow-gold"
              >
                <Sparkles className="w-4 h-4" />
                <span>{activated ? 'ĐÃ KÍCH HOẠT ĐẶC QUYỀN' : 'KÍCH HOẠT THẺ VIP NGAY'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyVipCode}
                className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-wider uppercase inline-flex items-center gap-2 transition-all active:scale-95"
              >
                {vipCodeCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Đã lưu mã: YIFU-VIP-BLACK</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-luxury-gold" />
                    <span>Lấy mã thẻ: YIFU-VIP-BLACK</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive 3D Holographic Card */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <p className="text-2xs sm:text-xs text-luxury-gold/80 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4 flex items-center gap-2 text-center">
              <span className="w-2 h-2 rounded-full bg-luxury-gold animate-ping shrink-0" />
              <span>Chạm hoặc di chuột để trải nghiệm hiệu ứng 3D Hologram</span>
            </p>

            <div className="w-full max-w-[460px] aspect-[1.586/1]">
              <Card3D
                maxRotate={18}
                glareOpacity={0.35}
                borderGlow={true}
                className="rounded-2xl"
              >
                {/* VIP Black Card Body */}
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#1b1c1e] via-[#121314] to-[#080809] p-4 sm:p-7 md:p-8 flex flex-col justify-between overflow-hidden border border-luxury-gold/40 shadow-2xl">
                  {/* Subtle carbon weave pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(#c9a96e 1px, transparent 1px)`,
                      backgroundSize: '16px 16px',
                    }}
                  />

                  {/* Holographic metallic iridescent rainbow sheen */}
                  <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-luxury-gold/15 to-transparent pointer-events-none rotate-45" />

                  {/* Top Bar: Brand & Chip */}
                  <div className="relative z-10 flex items-center justify-between" style={{ transform: 'translateZ(25px)' }}>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-luxury-gold/20 border border-luxury-gold/60 flex items-center justify-center text-luxury-gold shrink-0">
                        <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-xs sm:text-sm tracking-[0.15em] text-gold-gradient block">
                          SHOP QUAN AO ATELIER
                        </span>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-400">
                          HAUTE COUTURE VIP
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 text-luxury-gold/70">
                      <Wifi className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
                      <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-luxury-gold">
                        NFC VIP
                      </span>
                    </div>
                  </div>

                  {/* Middle: 3D Gold Smart Chip */}
                  <div className="relative z-10 my-auto py-1 sm:py-2" style={{ transform: 'translateZ(35px)' }}>
                    <div className="w-9 sm:w-12 h-7 sm:h-9 rounded-md bg-gradient-to-br from-[#f5d77f] via-[#c4973b] to-[#805e1b] border border-[#ffe599] shadow-md relative overflow-hidden">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/40" />
                      <div className="absolute inset-y-0 left-1/3 w-[1px] bg-black/40" />
                      <div className="absolute inset-y-0 right-1/3 w-[1px] bg-black/40" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 rounded-full border border-black/30" />
                    </div>

                    {/* Embossed Card Number */}
                    <div className="mt-2.5 sm:mt-4 font-mono text-xs sm:text-base md:text-xl font-bold tracking-[0.14em] sm:tracking-[0.25em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
                      8888 &bull; 9999 &bull; 2026 &bull; 7777
                    </div>
                  </div>

                  {/* Bottom: Cardholder info */}
                  <div className="relative z-10 flex items-end justify-between" style={{ transform: 'translateZ(30px)' }}>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-luxury-gold/80 font-medium">
                        CHỦ THẺ ĐẶC QUYỀN
                      </p>
                      <p className="font-serif text-xs sm:text-sm font-bold text-white uppercase tracking-wider mt-0.5">
                        QUÝ KHÁCH HÀNG THƯỢNG LƯU
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-luxury-gold/80 font-medium">
                        HẠN THẺ
                      </p>
                      <p className="font-mono text-xs sm:text-sm font-bold text-white tracking-widest mt-0.5">
                        VĨNH VIỄN
                      </p>
                    </div>
                  </div>
                </div>
              </Card3D>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 text-center italic">
              Được bảo chứng bởi SHOP QUAN AO &bull; Giấy phép phục vụ VIP Concierge số 08/2026/VIP
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
