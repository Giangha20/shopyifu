'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card3D } from '@/components/ui/card-3d';

interface CategoryCard {
  id: string;
  name: string;
  subtitle: string;
  itemCount: string;
  image: string;
  link: string;
  featured?: boolean;
}

const CATEGORIES: (CategoryCard & { badge?: string })[] = [
  {
    id: 'nu',
    name: 'Thời Trang Nữ & Đầm Thiết Kế',
    subtitle: 'Quý phái, thanh lịch và kiêu kỳ',
    itemCount: '150+ Mẫu mới 2026',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    link: '/danh-muc/dam-vay-thiet-ke',
    featured: true,
  },
  {
    id: 'thuedo',
    name: 'Dịch Vụ Thuê Đồ Sự Kiện & Dạ Hội',
    subtitle: 'Đầm thảm đỏ & Tuxedo cao cấp',
    itemCount: 'Chỉ từ 250.000₫/ngày',
    image:
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
    link: '/thue-do',
    badge: 'HOT TRENDING',
  },
  {
    id: 'nam',
    name: 'Thời Trang Nam & Suit Ý',
    subtitle: 'Lịch lãm, quyền lực & chuẩn mực',
    itemCount: '120+ Thiết kế may đo',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
    link: '/danh-muc/ao-khoac-blazer',
  },
  {
    id: 'phukien',
    name: 'Túi Da & Phụ Kiện Thủ Công',
    subtitle: 'Chế tác da Epsom Ý nguyên tấm',
    itemCount: '80+ Tác phẩm giới hạn',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
    link: '/danh-muc/tui-xach-da',
  },
  {
    id: 'trangsuc',
    name: 'Trang Sức Kim Hoàn & Ngọc Trai',
    subtitle: 'Kim cương thiên nhiên & Vàng 18K',
    itemCount: '65+ Kiệt tác độc bản',
    image:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop',
    link: '/danh-muc/phu-kien-trang-suc',
  },
];


export function CategoryGrid() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <div className="flex items-center gap-2 text-luxury-gold mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold tracking-[0.25em]">
                DANH MỤC TUYỂN CHỌN
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-black">
              Bộ Sưu Tập Theo Phong Cách
            </h2>
          </div>
          <Link
            href="/san-pham"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-luxury-black hover:text-luxury-gold transition-colors"
          >
            <span>Xem tất cả danh mục</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid: Row 1 (7 cols + 5 cols), Row 2 (4 cols + 4 cols + 4 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Card 1: Thời Trang Nữ & Đầm Thiết Kế (lg:col-span-7) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-7 h-[340px] sm:h-[440px] lg:h-[520px] relative rounded-3xl"
          >
            <Card3D maxRotate={7} glareOpacity={0.2} borderGlow={true} className="rounded-3xl overflow-hidden shadow-lg border border-slate-100">
              <Link href={CATEGORIES[0].link} className="block w-full h-full relative group">
                <Image
                  src={CATEGORIES[0].image}
                  alt={CATEGORIES[0].name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white">
                  <span className="text-xs uppercase tracking-widest text-luxury-gold font-semibold mb-1.5">
                    {CATEGORIES[0].itemCount}
                  </span>
                  <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold mb-1.5">
                    {CATEGORIES[0].name}
                  </h3>
                  <p className="text-xs sm:text-base text-slate-300 mb-4 sm:mb-6 max-w-md font-light line-clamp-2">
                    {CATEGORIES[0].subtitle}
                  </p>

                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-luxury-gold group-hover:text-white transition-colors">
                    <span>Khám phá bộ sưu tập</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </Card3D>
          </motion.div>

          {/* Card 2: Dịch Vụ Thuê Đồ Sự Kiện & Dạ Hội (lg:col-span-5) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sm:col-span-2 lg:col-span-5 h-[340px] sm:h-[440px] lg:h-[520px] relative rounded-3xl"
          >
            <Card3D maxRotate={9} glareOpacity={0.3} borderGlow={true} className="rounded-3xl overflow-hidden shadow-lg border-2 border-luxury-gold/50">
              <Link href={CATEGORIES[1].link} className="block w-full h-full relative group">
                <Image
                  src={CATEGORIES[1].image}
                  alt={CATEGORIES[1].name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Special Tag */}
                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
                  <span className="badge-gold text-2xs sm:text-xs px-2.5 sm:px-3 py-1 font-bold shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DỊCH VỤ THUÊ ĐỒ 5 SAO</span>
                  </span>
                </div>

                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white">
                  <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold mb-1.5">
                    {CATEGORIES[1].itemCount}
                  </span>
                  <h3 className="font-serif text-xl sm:text-3xl font-bold mb-1.5">
                    {CATEGORIES[1].name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mb-4 sm:mb-6 font-light line-clamp-2">
                    {CATEGORIES[1].subtitle}
                  </p>

                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-luxury-gold group-hover:text-white transition-colors bg-white/10 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-xl border border-white/20 w-fit">
                    <span>Khám phá tủ đồ thuê</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </Card3D>
          </motion.div>

          {/* Row 2: 3 Cards (Col-span 4 each) */}
          {CATEGORIES.slice(2).map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="sm:col-span-1 lg:col-span-4 h-[230px] sm:h-[280px] lg:h-[320px] relative rounded-3xl"
            >
              <Card3D maxRotate={8} glareOpacity={0.2} borderGlow={true} className="rounded-3xl overflow-hidden shadow-md border border-slate-100">
                <Link href={cat.link} className="block w-full h-full relative group">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                    <span className="text-[11px] uppercase tracking-wider text-luxury-gold font-semibold mb-1">
                      {cat.itemCount}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-light mb-4 line-clamp-1">
                      {cat.subtitle}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-luxury-gold group-hover:text-white transition-colors">
                      <span>Xem ngay</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
