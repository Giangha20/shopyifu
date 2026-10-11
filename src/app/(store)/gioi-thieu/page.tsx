import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, Shield, Award, Gem, ArrowRight, HeartHandshake } from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

export const metadata: Metadata = {
  title: 'Câu Chuyện Thương Hiệu & Di Sản Nghệ Nhân | LUXE SHOP',
  description: 'Khám phá hành trình kiến tạo chuẩn mực thời trang thượng lưu Việt Nam, kết hợp tinh hoa lụa tơ tằm truyền thống và nghệ thuật may đo cao cấp đương đại.',
  openGraph: {
    title: 'Câu Chuyện LUXE SHOP - Di Sản Thời Trang Thượng Hạng',
    description: 'Nghệ thuật thủ công tinh xảo, chất liệu thượng hạng và phong cách quý phái.',
    images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80' }],
  },
};

const STATS = [
  { value: '2018', label: 'Năm Khởi Nguồn' },
  { value: '15.000+', label: 'Khách Hàng Thượng Lưu' },
  { value: '100%', label: 'Lụa Tự Nhiên & Da Thật' },
  { value: '48 Giờ', label: 'Chế Tác Thủ Công Mỗi Mẫu' },
];

const VALUES = [
  {
    icon: Gem,
    title: 'Đỉnh Cao Chất Liệu',
    desc: 'Tuyển chọn khắt khe 100% lụa tơ tằm tự nhiên Bảo Lộc và da bê Box Calf nguyên tấm từ các xưởng thuộc da danh tiếng tại Florence, Ý.',
  },
  {
    icon: Award,
    title: 'Tinh Hoa Nghệ Nhân',
    desc: 'Mỗi chi tiết đính kết, đường viền may tay đều do các nghệ nhân có trên 20 năm thâm niên trực tiếp chế tác tỉ mỉ tại Atelier riêng biệt.',
  },
  {
    icon: Shield,
    title: 'Độc Bản & Cá Nhân Hóa',
    desc: 'Chúng tôi tin mỗi người phụ nữ là một tuyệt tác duy nhất. Các thiết kế giới hạn mang đậm dấu ấn phong thái kiêu sa, quyền quý.',
  },
  {
    icon: HeartHandshake,
    title: 'Thời Trang Bền Vững',
    desc: 'Tôn trọng thiên nhiên và môi trường. Quy trình nhuộm thảo mộc tự nhiên không hóa chất độc hại, thân thiện với làn da nhạy cảm.',
  },
];

const GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    title: 'Thiết Kế Đầm Lụa Dạ Tiệc',
  },
  {
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    title: 'Xưởng Chế Tác Da Thủ Công',
  },
  {
    url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    title: 'Vải Dạ Tweed Thượng Hạng',
  },
  {
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    title: 'Tranh Thêu Tơ Tằm Cung Đình',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <div className="relative bg-luxury-black text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&q=80"
            alt="LUXE Atelier background"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/70 to-luxury-black/40" />
        </div>

        <div className="container-luxe relative z-10 text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-luxury-gold mb-3">
            HÀNH TRÌNH KIẾN TẠO PHONG CÁCH
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Nơi Nghệ Thuật &amp; Đẳng Cấp Thượng Lưu Gặp Gỡ
          </h1>
          <p className="mt-6 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans">
            Ra đời từ tình yêu vô tận với lụa tơ tằm di sản Việt Nam và cảm hứng kiến trúc kinh thành hoa lệ, LUXE SHOP định hình chuẩn mực thời trang dạ tiệc độc bản cho giới tinh hoa.
          </p>
        </div>
      </div>

      <div className="container-luxe pt-6">
        <Breadcrumbs items={[{ label: 'Giới thiệu' }]} />

        {/* Story Section */}
        <section className="py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              CÂU CHUYỆN KHỞI NGUỒN
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight leading-snug">
              Hồi Sinh Hồn Cốt Lụa Việt Trong Hơi Thở Hiện Đại
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Khởi đầu từ một xưởng may đo may mặc thủ công nhỏ tại phố cổ Hà Nội năm 2018, chúng tôi luôn trăn trở trước câu hỏi: Làm thế nào để tơ lụa truyền thống Việt Nam không chỉ nằm trong bảo tàng hay dịp lễ hội, mà bước thẳng vào các bữa tiệc xa hoa và sự kiện ngoại giao quốc tế?
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tại LUXE SHOP, mỗi mét vải tơ tằm dệt thủ công được kết hợp cùng kỹ thuật dựng phom 3D tân tiến của Haute Couture Pháp. Chúng tôi không chạy theo xu hướng nhất thời, mà sáng tạo những tác phẩm trường tồn với thời gian, tôn vinh khí chất uyển chuyển mà kiêu hãnh của người phụ nữ Á Đông.
            </p>
            <div className="pt-2">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 rounded-xl bg-luxury-black px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-luxury-lg hover:bg-luxury-black-light transition-all"
              >
                <span>Khám phá các bộ sưu tập</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-luxury-xl border border-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&q=85"
                alt="Nghệ nhân LUXE chế tác thủ công"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-6 shadow-luxury-lg border border-gray-100 hidden sm:block max-w-xs">
              <Sparkles className="h-6 w-6 text-luxury-gold mb-2" />
              <p className="font-serif text-sm font-bold text-slate-900">
                100% Nghệ Nhân Thủ Công
              </p>
              <p className="text-2xs text-slate-500 mt-1">
                Từng đường kim mũi chỉ được thêu dệt bằng cả trái tim và niềm tự hào di sản.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Counter Section */}
        <section className="py-12 border-y border-gray-100 my-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <span className="font-serif text-3xl sm:text-5xl font-bold text-luxury-gold tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              GIÁ TRỊ CỐT LÕI
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight mt-2">
              Những Nguyên Tắc Bất Biến Của LUXE
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-500">
              Định vị vị thế của chúng tôi trong lòng giới mộ điệu thời trang cao cấp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-luxury-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-luxury-gold mb-6 shadow-glow">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">
                      {val.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16 sm:py-20 border-t border-gray-100">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              KHOẢNH KHẮC ATELIER
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight mt-2">
              Hình Ảnh Xưởng Chế Tác
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {GALLERY_IMAGES.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 shadow-sm"
              >
                <Image
                  src={img.url}
                  alt={img.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-xs font-semibold text-white">
                    {img.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
