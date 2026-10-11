'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CategoryCard {
  id: string;
  name: string;
  subtitle: string;
  itemCount: string;
  image: string;
  link: string;
  featured?: boolean;
}

const CATEGORIES: CategoryCard[] = [
  {
    id: 'nu',
    name: 'Thời Trang Nữ',
    subtitle: 'Quý phái & Thanh lịch',
    itemCount: '150+ Mẫu mới',
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    link: '/danh-muc/dam-vay-thiet-ke',
    featured: true,
  },
  {
    id: 'nam',
    name: 'Thời Trang Nam',
    subtitle: 'Lịch lãm & Đẳng cấp',
    itemCount: '120+ Thiết kế',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
    link: '/danh-muc/ao-khoac-blazer',
  },
  {
    id: 'phukien',
    name: 'Túi Xách Da Thủ Công',
    subtitle: 'Chế tác da Ý nguyên tấm',
    itemCount: '80+ Tác phẩm',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
    link: '/danh-muc/tui-xach-da',
  },
  {
    id: 'trangsuc',
    name: 'Trang Sức & Kim Hoàn',
    subtitle: 'Kim cương & Vàng trắng',
    itemCount: '65+ Kiệt tác',
    image:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop',
    link: '/danh-muc/phu-kien-trang-suc',
  },
  {
    id: 'giay',
    name: 'Giày Da Thủ Công',
    subtitle: 'Kỹ nghệ đóng giày Châu Âu',
    itemCount: '90+ Kiểu dáng',
    image:
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop',
    link: '/san-pham?category=giay-cao-got',
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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Large Card: Thời Trang Nữ (lg:col-span-6 or 5) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-7 h-[420px] sm:h-[480px] lg:h-[540px] relative rounded-2xl overflow-hidden group shadow-md"
          >
            <Link href={CATEGORIES[0].link} className="block w-full h-full relative">
              <Image
                src={CATEGORIES[0].image}
                alt={CATEGORIES[0].name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Card Content */}
              <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end text-white">
                <span className="text-xs uppercase tracking-widest text-luxury-gold font-semibold mb-2">
                  {CATEGORIES[0].itemCount}
                </span>
                <h3 className="font-serif text-2xl sm:text-4xl font-bold mb-2">
                  {CATEGORIES[0].name}
                </h3>
                <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-md font-light">
                  {CATEGORIES[0].subtitle}
                </p>

                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-luxury-gold group-hover:text-white transition-colors">
                  <span>Khám phá bộ sưu tập</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right Column Grid: Thời Trang Nam & Túi Xách */}
          <div className="sm:col-span-2 lg:col-span-5 grid grid-cols-1 gap-6 sm:gap-8">
            {CATEGORIES.slice(1, 3).map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="h-[250px] sm:h-[255px] relative rounded-2xl overflow-hidden group shadow-md"
              >
                <Link href={cat.link} className="block w-full h-full relative">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <span className="text-[11px] uppercase tracking-wider text-luxury-gold font-semibold mb-1">
                      {cat.itemCount}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-light mb-3">
                      {cat.subtitle}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-luxury-gold group-hover:text-white transition-colors">
                      <span>Xem ngay</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom 2 Cards (lg:col-span-6 each) */}
          {CATEGORIES.slice(3).map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sm:col-span-1 lg:col-span-6 h-[260px] sm:h-[300px] relative rounded-2xl overflow-hidden group shadow-md"
            >
              <Link href={cat.link} className="block w-full h-full relative">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white">
                  <span className="text-[11px] uppercase tracking-wider text-luxury-gold font-semibold mb-1">
                    {cat.itemCount}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-light mb-4">
                    {cat.subtitle}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-luxury-gold group-hover:text-white transition-colors">
                    <span>Khám phá ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
