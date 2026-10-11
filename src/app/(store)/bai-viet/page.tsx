import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { fetchArticles } from '@/lib/api-client';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

export const metadata: Metadata = {
  title: 'Tạp Chí Thời Trang & Xu Hướng | LUXE Magazine',
  description: 'Khám phá thế giới thời trang thượng lưu, nghệ thuật thủ công tơ lụa và cẩm nang phong cách từ các chuyên gia hàng đầu.',
};

export default async function BlogPage() {
  const articles = await fetchArticles();
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-luxe pt-4">
        <Breadcrumbs items={[{ label: 'Tạp chí & Bài viết' }]} />

        <div className="mt-2 mb-12 text-center max-w-2xl mx-auto">
          <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
            LUXE JOURNAL
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-luxury-black tracking-tight">
            Tạp Chí Thời Trang &amp; Di Sản
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Nguồn cảm hứng phong cách quý phái, câu chuyện về những nghệ nhân dệt lụa và cẩm nang gìn giữ vẻ đẹp vượt thời gian.
          </p>
        </div>

        {/* Featured Article Hero */}
        {featuredArticle && (
          <div className="mb-14 overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-luxury-lg transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="relative aspect-[16/9] lg:aspect-auto lg:h-full lg:col-span-7 bg-slate-100">
                <Image
                  src={featuredArticle.featuredImage}
                  alt={featuredArticle.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div className="p-8 sm:p-12 lg:col-span-5 flex flex-col justify-between space-y-4">
                <div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-luxury-gold">
                    {featuredArticle.categoryName || 'Tiêu Điểm'}
                  </span>
                  <Link
                    href={`/bai-viet/${featuredArticle.slug}`}
                    className="mt-3 block font-serif text-2xl sm:text-3xl font-bold text-luxury-black hover:text-luxury-gold transition-colors leading-snug"
                  >
                    {featuredArticle.title}
                  </Link>
                  <p className="mt-3 text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-2xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{featuredArticle.authorName}</span>
                    <span>•</span>
                    <span>{featuredArticle.publishedAt}</span>
                  </div>
                  <Link
                    href={`/bai-viet/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-luxury-gold hover:underline"
                  >
                    Đọc tiếp <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
            Bài Viết Mới Nhất
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {otherArticles.map((art) => (
              <article
                key={art.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-luxury-lg transition-all duration-300"
              >
                <Link
                  href={`/bai-viet/${art.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block"
                >
                  <Image
                    src={art.featuredImage}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                  />
                  {art.categoryName && (
                    <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-2xs font-semibold text-slate-800 shadow-sm">
                      {art.categoryName}
                    </span>
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center gap-2 text-2xs text-slate-400 mb-2">
                      <Clock className="h-3 w-3" />
                      <span>{art.readingTime || '5 phút đọc'}</span>
                      <span>•</span>
                      <span>{art.publishedAt}</span>
                    </div>

                    <Link
                      href={`/bai-viet/${art.slug}`}
                      className="block font-serif text-lg font-bold text-slate-900 group-hover:text-luxury-gold transition-colors line-clamp-2 leading-snug"
                    >
                      {art.title}
                    </Link>

                    <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-2xs font-medium text-slate-600">
                      Bởi {art.authorName || 'LUXE Atelier'}
                    </span>
                    <Link
                      href={`/bai-viet/${art.slug}`}
                      className="text-xs font-semibold text-luxury-gold hover:underline flex items-center gap-1"
                    >
                      Xem thêm <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Signup Banner */}
        <div className="rounded-3xl bg-luxury-black p-8 sm:p-14 text-white text-center shadow-luxury-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <Sparkles className="h-8 w-8 text-luxury-gold mx-auto" />
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Đăng Ký Nhận Bản Tin Thời Trang LUXE
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Nhận thông báo độc quyền về các bộ sưu tập giới hạn, xu hướng thời trang mùa mới và ưu đãi VIP 10% cho đơn hàng đầu tiên.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn..."
                className="h-12 flex-1 rounded-xl border border-gray-700 bg-white/10 px-4 text-xs text-white placeholder:text-gray-400 backdrop-blur-md focus:border-luxury-gold focus:outline-none"
              />
              <button
                type="button"
                className="h-12 rounded-xl bg-luxury-gold px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-luxury-gold-dark transition-all shadow-glow"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
