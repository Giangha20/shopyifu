'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Quote,
  Star,
  CheckCircle,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

import { HeroBanner } from '@/components/store/hero-banner';
import { CategoryGrid } from '@/components/store/category-grid';
import { ProductCard, type ProductItem } from '@/components/store/product-card';
import { TrustBadges } from '@/components/store/trust-badges';
import { NewsletterSection } from '@/components/store/newsletter-section';
import { SAMPLE_PRODUCTS } from '@/lib/sample-data';

// Curated Luxury Products for "Sản Phẩm Mới" (New Arrivals)
const NEW_ARRIVALS: any[] = SAMPLE_PRODUCTS.slice(0, 4);
const BEST_SELLERS: any[] = SAMPLE_PRODUCTS.slice(4, 8);
const DUMMY_PRODUCTS_UNUSED: any[] = [

  {
    id: 'prod-new-1',
    name: 'Đầm Lụa Tơ Tằm Thêu Tay Hoàng Gia',
    slug: 'dam-lua-to-tam-theu-tay-hoang-gia',
    price: 3850000,
    compareAtPrice: 4500000,
    category: 'Thời Trang Nữ',
    isNew: true,
    rating: 5,
    reviewCount: 18,
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    ],
    variants: [
      { id: 'v1', name: 'Size S (Vàng Gold)' },
      { id: 'v2', name: 'Size M (Vàng Gold)' },
      { id: 'v3', name: 'Size L (Vàng Gold)' },
    ],
  },
  {
    id: 'prod-new-2',
    name: 'Suit Nam May Đo Vải Len Merino Ý',
    slug: 'suit-nam-may-do-vai-len-merino-y',
    price: 8900000,
    compareAtPrice: 10500000,
    category: 'Thời Trang Nam',
    isNew: true,
    rating: 5,
    reviewCount: 24,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    ],
    variants: [
      { id: 'v4', name: 'Size 48 / M' },
      { id: 'v5', name: 'Size 50 / L' },
      { id: 'v6', name: 'Size 52 / XL' },
    ],
  },
  {
    id: 'prod-new-3',
    name: 'Túi Da Bò Epsom Chế Tác Thủ Công',
    slug: 'tui-da-bo-epsom-che-tac-thu-cong',
    price: 6200000,
    compareAtPrice: null,
    category: 'Phụ Kiện',
    isNew: true,
    rating: 4.9,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    ],
    variants: [
      { id: 'v7', name: 'Đen Noir' },
      { id: 'v8', name: 'Nâu Caramel' },
    ],
  },
  {
    id: 'prod-new-4',
    name: 'Áo Khoác Dạ Cashmere Dáng Dài Quý Tộc',
    slug: 'ao-khoac-da-cashmere-dang-dai-quy-toc',
    price: 7600000,
    compareAtPrice: 8800000,
    category: 'Thời Trang Nữ',
    isNew: true,
    rating: 5,
    reviewCount: 15,
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    ],
    variants: [
      { id: 'v9', name: 'Size S (Beigie)' },
      { id: 'v10', name: 'Size M (Beigie)' },
    ],
  },
];

// Curated Bestsellers
const BESTSELLERS: any[] = SAMPLE_PRODUCTS.slice(4, 8);
const DUMMY_BESTSELLERS_UNUSED: any[] = [

  {
    id: 'prod-best-1',
    name: 'Đồng Hồ Cơ Automatic Skeleton Chế Tác',
    slug: 'dong-ho-co-automatic-skeleton-che-tac',
    price: 15500000,
    compareAtPrice: 18000000,
    category: 'Đồng Hồ',
    isBestseller: true,
    rating: 5,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    ],
    variants: [
      { id: 'v11', name: 'Dây Da Cá Sấu Đen' },
      { id: 'v12', name: 'Dây Da Cá Sấu Nâu' },
    ],
  },
  {
    id: 'prod-best-2',
    name: 'Khăn Choàng Lụa Tơ Tằm Họa Tiết Cung Đình',
    slug: 'khan-choang-lua-to-tam-hoa-tiet-cung-dinh',
    price: 1850000,
    compareAtPrice: 2200000,
    category: 'Phụ Kiện',
    isBestseller: true,
    rating: 4.9,
    reviewCount: 67,
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80',
    ],
    variants: [
      { id: 'v13', name: 'Màu Vàng Đồng' },
      { id: 'v14', name: 'Màu Đỏ Rượu' },
    ],
  },
  {
    id: 'prod-best-3',
    name: 'Giày Oxford Da Bò Calfskin Đóng Đế Gỗ',
    slug: 'giay-oxford-da-bo-calfskin-dong-de-go',
    price: 4600000,
    compareAtPrice: null,
    category: 'Thời Trang Nam',
    isBestseller: true,
    rating: 5,
    reviewCount: 53,
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
    ],
    variants: [
      { id: 'v15', name: 'Size 40' },
      { id: 'v16', name: 'Size 41' },
      { id: 'v17', name: 'Size 42' },
    ],
  },
  {
    id: 'prod-best-4',
    name: 'Vòng Cổ Ngọc Trai Biển South Sea Vàng 18K',
    slug: 'vong-co-ngoc-trai-bien-south-sea-vang-18k',
    price: 21000000,
    compareAtPrice: 24500000,
    category: 'Trang Sức',
    isBestseller: true,
    rating: 5,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    ],
    variants: [{ id: 'v18', name: 'Chiều dài 45cm' }],
  },
];

// Testimonials data
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Doanh nhân Nguyễn Thu Thảo',
    title: 'Khách hàng VIP tại TP. Hồ Chí Minh',
    comment:
      'Chất lượng vải lụa và đường kim mũi chỉ của LUXE SHOP hoàn toàn sánh ngang với các nhà mốt xa xỉ tại Paris. Dịch vụ tư vấn trang phục riêng cực kỳ chu đáo và đẳng cấp.',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
  },
  {
    id: 2,
    name: 'Kiến trúc sư Trần Minh Hải',
    title: 'Hà Nội',
    comment:
      'Bộ suit đặt may phom dáng chuẩn mực Ý, chất vải len Merino nhẹ và thông thoáng tuyệt đối. Từ ngày diện đồ của LUXE, đối tác và khách hàng luôn dành cho tôi sự tín nhiệm đặc biệt.',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
  },
  {
    id: 3,
    name: 'Bà Hoàng Mai Linh',
    title: 'CEO & Nhà Sáng Lập, Đà Nẵng',
    comment:
      'Túi da Epsom và khăn lụa tơ tằm đóng gói hộp quà vô cùng chỉn chu. Dịch vụ đổi trả trong 30 ngày hỗ trợ rất nhanh nhẹn và lịch thiệp.',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
  },
];

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<any[]>(NEW_ARRIVALS);
  const [bestSellers, setBestSellers] = useState<any[]>(BEST_SELLERS);

  // Fetch real database products so admin edits immediately show on homepage
  useEffect(() => {
    fetch('/api/products?limit=24&sort=newest')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const prods = data.data.map((p: any) => ({
            ...p,
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            avgRating: Number(p.avgRating) || 5.0,
            reviewCount: Number(p.reviewCount) || 0,
            soldCount: Number(p.soldCount) || 0,
            images: p.images?.map((i: any) => (typeof i === 'string' ? { url: i, id: i } : { url: i?.url || i, id: i?.id || i })) || [],
          }));
          const news = prods.filter((p: any) => p.isNew);
          setNewArrivals(news.length >= 4 ? news.slice(0, 8) : prods.slice(0, 8));

          const best = prods.filter((p: any) => p.isBestseller);
          setBestSellers(
            best.length >= 4
              ? best.slice(0, 8)
              : prods.slice(4, 12).length >= 4
              ? prods.slice(4, 12)
              : prods.slice(0, 8)
          );
        }
      })
      .catch((err) => console.warn('Could not fetch products for home page:', err));
  }, []);

  // Countdown Timer State for Promotional Banner
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 36,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. HERO BANNER SLIDER */}
      <HeroBanner />

      {/* 2. TRUST BADGES */}
      <TrustBadges />

      {/* 3. FEATURED CATEGORIES (BENTO GRID) */}
      <CategoryGrid />

      {/* 4. NEW ARRIVALS (SẢN PHẨM MỚI) */}
      <section className="py-16 sm:py-24 bg-slate-50/50">
        <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-luxury-gold mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase font-semibold tracking-[0.25em]">
                  MÙA MỐI 2026
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-black">
                Sản Phẩm Mới Ra Mắt
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-xl">
                Khám phá những thiết kế mới nhất vừa được đưa lên kệ, kết hợp vẻ đẹp đương đại cùng kỹ thuật thủ công lâu đời.
              </p>
            </div>

            <Link
              href="/collections/new-arrival"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-luxury-black hover:text-luxury-gold transition-colors"
            >
              <span>Xem toàn bộ bộ sưu tập mới</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER WITH LIVE COUNTDOWN TIMER */}
      <section className="py-16 sm:py-20 bg-luxury-black text-white relative overflow-hidden">
        {/* Decorative background image */}
        <div className="absolute inset-0 opacity-25">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
            alt="Private Sale Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-black/95 to-luxury-black/80" />

        <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Promo Info */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-gold/20 border border-luxury-gold/40 text-luxury-gold text-xs font-semibold tracking-widest uppercase">
                <Clock className="w-3.5 h-3.5" />
                <span>ƯU ĐÃI RIÊNG TƯ CÓ HẠN</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Mid-Season Private Sale <br />
                <span className="text-luxury-gold">Ưu đãi lên đến 40%</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
                Đặc quyền dành riêng cho khách hàng trực tuyến tại LUXE SHOP. Áp dụng cho các trang phục dạ tiệc, áo blazer và phụ kiện da giới hạn.
              </p>

              {/* Countdown Display */}
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center border border-white/15">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-luxury-gold">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-300 uppercase font-medium">
                      Ngày
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center border border-white/15">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-luxury-gold">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-300 uppercase font-medium">
                      Giờ
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center border border-white/15">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-luxury-gold">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-300 uppercase font-medium">
                      Phút
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 text-center border border-white/15">
                    <span className="block font-serif text-2xl sm:text-3xl font-bold text-luxury-gold">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-300 uppercase font-medium">
                      Giây
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/promotions"
                  className="btn-gold px-8 py-4 rounded-xl text-sm font-semibold tracking-wider uppercase inline-flex items-center gap-2 shadow-glow"
                >
                  <span>Khám phá ưu đãi ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Promo Featured Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <Image
                  src="https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1000&auto=format&fit=crop"
                  alt="Exclusive Look"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-luxury-gold font-bold">
                        VOUCHER: LUXE40
                      </p>
                      <p className="text-sm font-serif font-bold text-white">
                        Giảm trực tiếp 40% giỏ hàng
                      </p>
                    </div>
                    <span className="badge-sale text-xs px-2.5 py-1">SALE VIP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BESTSELLERS (BÁN CHẠY NHẤT) */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-luxury-gold mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase font-semibold tracking-[0.25em]">
                  ĐƯỢC ƯA CHUỘNG NHẤT
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-black">
                Kiệt Tác Bán Chạy Nhất
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-xl">
                Những tuyệt phẩm được săn đón nhiều nhất bởi giới mộ điệu thời trang và giới doanh nhân tinh hoa.
              </p>
            </div>

            <Link
              href="/products?sort=bestseller"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-luxury-black hover:text-luxury-gold transition-colors"
            >
              <span>Xem tất cả sản phẩm bán chạy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. BRAND STORY (CÂU CHUYỆN THƯƠNG HIỆU) */}
      <section className="py-20 sm:py-28 bg-luxury-cream/40 border-t border-luxury-gold/15 relative overflow-hidden">
        <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Images Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-luxury">
                <Image
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop"
                  alt="Kỹ nghệ may đo thủ công LUXE"
                  fill
                  sizes="350px"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-luxury mt-8">
                <Image
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop"
                  alt="Không gian boutique LUXE"
                  fill
                  sizes="350px"
                  className="object-cover"
                />
              </div>

              {/* Floating Stat Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-luxury-black text-white p-5 rounded-2xl shadow-2xl border border-luxury-gold/40 text-center min-w-[170px]">
                <Award className="w-6 h-6 text-luxury-gold mx-auto mb-1" />
                <span className="font-serif text-2xl font-bold text-luxury-gold block">
                  15+ Năm
                </span>
                <span className="text-[11px] text-slate-300 font-medium tracking-wider uppercase">
                  Di Sản May Đo Cao Cấp
                </span>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-luxury-gold">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase font-semibold tracking-[0.25em]">
                  DI SẢN & TÔN CHỈ THƯƠNG HIỆU
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-black leading-tight">
                Kỹ Nghệ Chế Tác Thượng Đỉnh <br />
                <span className="text-luxury-gold font-light italic">
                  Đánh thức vẻ đẹp vĩnh cửu
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Được thành lập với sứ mệnh mang đến trải nghiệm thời trang xa xỉ đích thực cho giới thượng lưu Việt Nam, LUXE SHOP kết hợp tinh hoa thẩm mỹ phương Tây cùng sự thấu hiểu sâu sắc vóc dáng người Á Đông.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Mỗi thiết kế xuất xưởng là thành quả của hàng trăm giờ miệt mài may đo thủ công, chọn lựa từ những thước vải lụa tơ tằm nguyên bản, dạ len Cashmere cao cấp và da bò Ý hảo hạng.
              </p>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <span className="block font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
                    100%
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Chất liệu thượng hạng
                  </span>
                </div>
                <div>
                  <span className="block font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
                    50K+
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Khách hàng quý tộc
                  </span>
                </div>
                <div>
                  <span className="block font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
                    24/7
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Dịch vụ Private Concierge
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="btn-primary py-3 px-7 rounded-xl inline-flex items-center gap-2"
                >
                  <span>Tìm hiểu thêm về LUXE SHOP</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS (TESTIMONIALS) */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="container-luxe mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-luxury-gold mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold tracking-[0.25em]">
                TIẾNG NÓI TỪ KHÁCH HÀNG
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-luxury-black">
              Đặc Quyền Của Sự Hài Lòng
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-3">
              Những chia sẻ chân thực từ các quý khách hàng và doanh nhân gắn bó lâu năm cùng LUXE SHOP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-2xl p-8 border border-gray-100 flex flex-col justify-between hover:shadow-luxury hover:bg-white transition-all duration-300 relative group"
              >
                <div>
                  <Quote className="w-10 h-10 text-luxury-gold/30 mb-4" />

                  {/* Rating Stars */}
                  <div className="flex items-center text-amber-400 gap-1 mb-4">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                    &quot;{item.comment}&quot;
                  </p>
                </div>

                {/* User avatar and info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-luxury-gold/30">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif text-sm font-bold text-luxury-black">
                        {item.name}
                      </h4>
                      <CheckCircle className="w-3.5 h-3.5 text-luxury-gold" />
                    </div>
                    <p className="text-xs text-slate-500">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER SUBSCRIPTION SECTION */}
      <NewsletterSection />
    </div>
  );
}
