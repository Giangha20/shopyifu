'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Eye,
  RotateCw,
  Crown,
  ShieldCheck,
  Scissors,
  ArrowRight,
  Info,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Card3D } from '@/components/ui/card-3d';

interface ShowroomItem {
  id: string;
  name: string;
  category: string;
  rentalPrice: string;
  retailPrice: string;
  atelierNote: string;
  angles: {
    label: string;
    image: string;
  }[];
  hotspots: {
    x: number; // percentage
    y: number; // percentage
    title: string;
    description: string;
  }[];
}

const SHOWROOM_ITEMS: ShowroomItem[] = [
  {
    id: 'gown-crystal',
    name: 'Đầm Dạ Hội Hoàng Gia Dát Pha Lê Swarovski',
    category: 'Haute Couture Evening Gown',
    rentalPrice: '1.500.000₫ / ngày',
    retailPrice: '48.000.000₫',
    atelierNote:
      'Chế tác bởi 3 nghệ nhân thêu tay trong 96 giờ liên tục. Form dáng corset tôn eo đồng hồ cát, phủ 1.200 viên pha lê Swarovski tán sắc ánh sao.',
    angles: [
      {
        label: 'Góc Trực Diện (Front)',
        image:
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
      },
      {
        label: 'Góc Nghiêng 45° (Side)',
        image:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      },
      {
        label: 'Chi Tiết Thêu Pha Lê (Macro)',
        image:
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    hotspots: [
      {
        x: 52,
        y: 28,
        title: 'Corset Định Hình Eo Hoàng Gia',
        description: 'Xương gọng thép mềm chuẩn Paris, giảm ngay 4-6cm vòng eo tự nhiên.',
      },
      {
        x: 65,
        y: 55,
        title: 'Pha Lê Swarovski Tinh Thể',
        description: 'Đính kết thủ công đa góc độ, phản chiếu ánh sáng rực rỡ dưới đèn sân khấu.',
      },
      {
        x: 38,
        y: 75,
        title: 'Tà Váy Lụa Tơ Tằm Tự Nhiên',
        description: 'Lụa Mulberry 100% bồng bềnh, tạo độ thướt tha uyển chuyển khi bước đi.',
      },
    ],
  },
  {
    id: 'suit-tuxedo',
    name: 'Tuxedo Dạ Tiệc Savile Row Đính Kim Tuyến',
    category: 'Bespoke Men Tuxedo',
    rentalPrice: '1.200.000₫ / ngày',
    retailPrice: '38.000.000₫',
    atelierNote:
      'Chất liệu len lông cừu Merino Ý dệt vân chìm ánh kim. Cổ ve nhung lụa Ý sang trọng, may dựng canvassing truyền thống giữ phom phẳng phiu suốt sự kiện.',
    angles: [
      {
        label: 'Góc Trực Diện (Front)',
        image:
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      },
      {
        label: 'Góc Nghiêng Phong Cách (Side)',
        image:
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
      },
      {
        label: 'Cận Cảnh Cổ Ve Áo (Macro)',
        image:
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    hotspots: [
      {
        x: 50,
        y: 26,
        title: 'Cổ Ve Nhung Lụa Satin Cao Cấp',
        description: 'Độ bóng sâu huyền bí, tạo điểm nhấn chuẩn mực cho cà vạt nơ ngoại giao.',
      },
      {
        x: 60,
        y: 48,
        title: 'Khuy Bọc Thủ Công Khảm Xà Cừ',
        description: 'Khuy nhập khẩu từ xưởng chế tác Florence, Ý.',
      },
    ],
  },
  {
    id: 'bag-himalaya',
    name: 'Túi Xách Da Độc Bản Khóa Mạ Vàng 18K',
    category: 'High-End Leathercraft',
    rentalPrice: '1.800.000₫ / ngày',
    retailPrice: '62.000.000₫',
    atelierNote:
      'Chế tác từ da Epsom thuộc thảo mộc Pháp. Từng đường khâu yên ngựa Saddle Stitch thủ công hoàn toàn bằng chỉ sáp Fil Au Chinois truyền thống.',
    angles: [
      {
        label: 'Góc Trực Diện (Front)',
        image:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop',
      },
      {
        label: 'Góc Nghiêng Tinh Xảo (Side)',
        image:
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
      },
      {
        label: 'Khóa Khảm Vàng (Macro)',
        image:
          'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1200&auto=format&fit=crop',
      },
    ],
    hotspots: [
      {
        x: 50,
        y: 45,
        title: 'Ổ Khóa Hợp Kim Mạ Vàng 18K',
        description: 'Được đánh bóng gương thủ công, khắc chìm số seri độc bản của Atelier.',
      },
      {
        x: 70,
        y: 65,
        title: 'Đường Chỉ Khâu Yên Ngựa Thủ Công',
        description: 'Bền bỉ vĩnh cửu theo thời gian, không bao giờ bị tưa hay đứt chỉ.',
      },
    ],
  },
];

export function VirtualShowroom3D() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const currentItem = SHOWROOM_ITEMS[selectedItemIndex];

  return (
    <section className="py-24 sm:py-32 bg-[#0E0E10] text-white relative overflow-hidden border-t border-luxury-gold/20">
      {/* Stage ambient lights & circular stage base */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-luxury-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-luxe relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-luxury-gold mb-3">
              <RotateCw className="w-4 h-4 animate-spin-slow" />
              <span className="text-xs uppercase font-semibold tracking-[0.25em]">
                PHÒNG TRƯNG BÀY 3D TƯƠNG TÁC &bull; ATELIER STAGE
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold">
              Trải Nghiệm Đa Góc Nhìn{' '}
              <span className="text-gold-gradient block sm:inline">Không Gian 3D</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
              Xoay đổi góc nhìn, phóng to chi tiết đính kết thủ công và chạm vào từng điểm chạm tinh hoa của trang phục dạ hội trước khi đặt thuê.
            </p>
          </div>

          {/* Model Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.05] border border-white/10 shrink-0 overflow-x-auto no-scrollbar">
            {SHOWROOM_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedItemIndex(idx);
                  setCurrentAngleIndex(0);
                  setActiveHotspot(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 whitespace-nowrap ${
                  selectedItemIndex === idx
                    ? 'bg-luxury-gold text-luxury-black font-bold shadow-gold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.id === 'gown-crystal'
                  ? '👗 Đầm Dạ Hội Pha Lê'
                  : item.id === 'suit-tuxedo'
                  ? '🤵 Tuxedo Savile Row'
                  : '👜 Túi Da Độc Bản'}
              </button>
            ))}
          </div>
        </div>

        {/* Main 3D Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: 3D Stage with Interactive Hotspots */}
          <div className="lg:col-span-7 relative flex flex-col items-center">
            {/* 3D Perspective Card Container */}
            <div className="w-full max-w-[540px] aspect-[4/5] relative">
              <Card3D maxRotate={14} glareOpacity={0.25} borderGlow={true} className="rounded-3xl">
                <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-900/90 via-black to-neutral-950 border border-luxury-gold/30 shadow-2xl flex items-center justify-center">
                  {/* Backdrop Light Cone */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-luxury-gold/25 via-transparent to-transparent pointer-events-none" />

                  {/* Main Product Showcase Image - object-contain prevents any side cropping */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${currentItem.id}-${currentAngleIndex}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.04 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="relative w-full h-full p-2 sm:p-4"
                    >
                      <Image
                        src={currentItem.angles[currentAngleIndex].image}
                        alt={currentItem.name}
                        fill
                        priority
                        unoptimized
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain object-center"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* 3D Circular Pedestal Shadow at Bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

                  {/* Interactive Hotspots on the model */}
                  {currentItem.hotspots.map((spot, idx) => (
                    <div
                      key={idx}
                      style={{
                        left: `${spot.x}%`,
                        top: `${spot.y}%`,
                        transform: 'translate(-50%, -50%) translateZ(40px)',
                      }}
                      className="absolute z-30"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHotspot(activeHotspot === idx ? null : idx);
                        }}
                        className={`group relative w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-125 focus:outline-none ${
                          activeHotspot === idx
                            ? 'bg-luxury-gold text-black ring-4 ring-luxury-gold/50'
                            : 'bg-black/75 backdrop-blur-md text-luxury-gold border border-luxury-gold/60'
                        }`}
                        title={spot.title}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-luxury-gold animate-ping absolute" />
                        <span className="relative text-xs font-bold">{idx + 1}</span>
                      </button>

                      {/* Hotspot Popover Tooltip */}
                      {activeHotspot === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-60 sm:w-64 max-w-[calc(100vw-3rem)] p-3.5 sm:p-4 rounded-xl bg-black/95 backdrop-blur-xl border border-luxury-gold/50 shadow-2xl z-40 text-left pointer-events-auto"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 text-luxury-gold text-xs font-bold">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span className="truncate">{spot.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveHotspot(null);
                              }}
                              className="text-slate-400 hover:text-white text-xs p-0.5"
                              aria-label="Đóng"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {spot.description}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  ))}

                  {/* Badge: Live 3D Stage Status */}
                  <div
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] uppercase font-bold tracking-widest text-luxury-gold flex items-center gap-2"
                    style={{ transform: 'translateZ(25px)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>3D ATELIER LIVE STAGE</span>
                  </div>

                  {/* Badge: Active Angle */}
                  <div
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-semibold tracking-wider text-white"
                    style={{ transform: 'translateZ(25px)' }}
                  >
                    {currentItem.angles[currentAngleIndex].label}
                  </div>
                </div>
              </Card3D>
            </div>

            {/* Angle Switcher Controls under the Stage */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 bg-white/[0.04] p-2 sm:p-2.5 rounded-2xl border border-white/10 w-full max-w-[540px]">
              <span className="text-xs text-slate-400 font-medium px-2 flex items-center gap-1.5 shrink-0">
                <RotateCw className="w-3.5 h-3.5 text-luxury-gold" />
                <span className="hidden sm:inline">Góc xoay:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {currentItem.angles.map((ang, aIdx) => (
                  <button
                    key={aIdx}
                    type="button"
                    onClick={() => setCurrentAngleIndex(aIdx)}
                    className={`px-3 py-1.5 rounded-xl text-2xs sm:text-xs font-semibold tracking-wider transition-all min-h-[34px] ${
                      currentAngleIndex === aIdx
                        ? 'bg-luxury-gold text-black shadow-gold font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {ang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Atelier Detailed Specs & Reservation */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold">
                {currentItem.category}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-2 text-white">
                {currentItem.name}
              </h3>
            </div>

            {/* Pricing Card */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-luxury-gold/30 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">
                    Giá thuê trọn gói sự kiện
                  </span>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-luxury-gold mt-0.5">
                    {currentItem.rentalPrice}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">
                    Giá trị sở hữu gốc
                  </span>
                  <div className="text-sm font-serif text-slate-300 line-through mt-0.5">
                    {currentItem.retailPrice}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Bao gồm bảo hiểm trang phục, phụ kiện đi kèm & giặt hấp 5 sao</span>
              </div>
            </div>

            {/* Atelier Story / Craftsman note */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-slate-300 flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-luxury-gold" />
                <span>Ghi chú từ Xưởng may Atelier SHOP QUAN AO:</span>
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed italic bg-white/[0.02] p-4 rounded-xl border border-white/5">
                &ldquo;{currentItem.atelierNote}&rdquo;
              </p>
            </div>

            {/* Specification Points */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Phom dáng & Size</span>
                <span className="font-serif font-semibold text-white mt-0.5 block">
                  Đo may cân chỉnh riêng (Custom Fit)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Thời gian chuẩn bị</span>
                <span className="font-serif font-semibold text-white mt-0.5 block">
                  Sẵn sàng giao trong 2 - 4 giờ
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/thue-do"
                className="btn-gold w-full sm:w-auto px-8 py-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase inline-flex items-center justify-center gap-2 shadow-gold text-center"
              >
                <span>Đặt thuê trang phục này</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/lien-he"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-wider uppercase inline-flex items-center justify-center gap-2 transition-all text-center"
              >
                <span>Hẹn thử đồ tại Boutique</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
