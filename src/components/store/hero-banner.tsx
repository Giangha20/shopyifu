'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: 'BỘ SƯU TẬP THU ĐÔNG 2026',
    title: 'Nghệ Thuật Của Sự',
    titleAccent: 'Tinh Tế & Quý Tộc',
    description:
      'Chắt lọc từ những chất liệu thượng hạng thế giới kết hợp kỹ nghệ may đo thủ công bậc thầy. Tôn vinh đẳng cấp riêng biệt của bạn.',
    primaryCtaText: 'Khám phá bộ sưu tập',
    primaryCtaLink: '/san-pham',
    secondaryCtaText: 'Xem Lookbook 2026',
    secondaryCtaLink: '/bai-viet',
    imageUrl:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 2,
    badge: 'HAUTE COUTURE EXCLUSIVE',
    title: 'Tuyệt Tác May Đo',
    titleAccent: 'Vượt Thời Gian',
    description:
      'Bộ sưu tập veston Ý và đầm lụa tơ tằm thượng phẩm dành riêng cho những dịp trọng đại và phong cách đỉnh cao.',
    primaryCtaText: 'Mua sắm ngay',
    primaryCtaLink: '/san-pham',
    secondaryCtaText: 'Đặt may riêng',
    secondaryCtaLink: '/lien-he',
    imageUrl:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 3,
    badge: 'LUXURY ACCESSORIES',
    title: 'Phụ Kiện Da &',
    titleAccent: 'Trang Sức Độc Bản',
    description:
      'Túi da cá sấu chế tác thủ công và đồng hồ cơ tinh xảo - điểm xuyết hoàn hảo cho diện mạo sang trọng cuốn hút.',
    primaryCtaText: 'Xem phụ kiện',
    primaryCtaLink: '/danh-muc/tui-xach-da',
    secondaryCtaText: 'Nhận tư vấn VIP',
    secondaryCtaLink: '/lien-he',
    imageUrl:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop',
  },
];

export function HeroBanner() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    const slide = HERO_SLIDES[0];
    return (
      <section className="relative w-full overflow-hidden bg-luxury-black">
        <div className="relative h-[580px] sm:h-[680px] lg:h-[780px] w-full">
          <div className="absolute inset-0 z-0">
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>
          <div className="relative z-10 h-full container-luxe mx-auto flex items-center">
            <div className="max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 sm:mb-6">
                <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-white/90">
                  {slide.badge}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15]">
                {slide.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold to-amber-200">
                  {slide.titleAccent}
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 mt-4 sm:mt-6 leading-relaxed max-w-xl font-light">
                {slide.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={slide.primaryCtaLink}
                  className="btn-gold px-7 py-3.5 rounded-xl font-medium text-sm shadow-glow flex items-center gap-2 group"
                >
                  <span>{slide.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={slide.secondaryCtaLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-medium text-white"
                >
                  <span>{slide.secondaryCtaText}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-luxury-black">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        loop={true}
        pagination={{
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} !w-3 !h-1.5 !rounded-full !bg-white/40 !transition-all duration-300 [&.swiper-pagination-bullet-active]:!w-8 [&.swiper-pagination-bullet-active]:!bg-luxury-gold"></span>`;
          },
        }}
        navigation={{
          nextEl: '.hero-next-btn',
          prevEl: '.hero-prev-btn',
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-[580px] sm:h-[680px] lg:h-[780px] w-full"
      >
        {HERO_SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            {/* Background Image with Dark Vignette Gradient */}
            <div className="absolute inset-0 z-0">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center scale-105 transition-transform duration-10000 ease-out"
                sizes="100vw"
              />
              {/* Luxury Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </div>

            {/* Slide Content */}
            <div className="relative z-10 h-full container-luxe mx-auto flex items-center">
              <div className="max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Badge */}
                <motion.div
                  key={`badge-${activeIndex}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 sm:mb-6"
                >
                  <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                  <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-white/90">
                    {slide.badge}
                  </span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  key={`title-${activeIndex}-${index}`}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15]"
                >
                  {slide.title}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold to-amber-200">
                    {slide.titleAccent}
                  </span>
                </motion.h1>

                {/* Subtitle / Description */}
                <motion.p
                  key={`desc-${activeIndex}-${index}`}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="text-sm sm:text-base lg:text-lg text-slate-200 mt-4 sm:mt-6 leading-relaxed max-w-xl font-light"
                >
                  {slide.description}
                </motion.p>

                {/* Call to Actions */}
                <motion.div
                  key={`cta-${activeIndex}-${index}`}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="mt-8 flex flex-wrap items-center gap-4"
                >
                  <Link
                    href={slide.primaryCtaLink}
                    className="btn-gold px-7 py-3.5 rounded-xl font-medium text-sm shadow-glow flex items-center gap-2 group"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={slide.secondaryCtaLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-luxury-black hover:border-white"
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Arrows for Desktop */}
        <div className="hidden lg:flex absolute bottom-12 right-12 z-20 items-center gap-3">
          <button
            type="button"
            className="hero-prev-btn w-12 h-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-luxury-gold hover:border-luxury-gold transition-all"
            aria-label="Slide trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="hero-next-btn w-12 h-12 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-luxury-gold hover:border-luxury-gold transition-all"
            aria-label="Slide tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Swiper>
    </section>
  );
}
