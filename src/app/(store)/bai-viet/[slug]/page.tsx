import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Eye, Share2, ArrowRight, User, Calendar, Tag } from 'lucide-react';
import { fetchArticleBySlug, fetchArticles } from '@/lib/api-client';
import { Breadcrumbs } from '@/components/store/breadcrumbs';

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const article = await fetchArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Không tìm thấy bài viết | LUXE Magazine',
      description: 'Bài viết không tồn tại hoặc đã được gỡ bỏ.',
    };
  }

  return {
    title: `${article.title} | LUXE Magazine`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.featuredImage }],
      type: 'article',
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const allArticles = await fetchArticles();
  const relatedArticles = allArticles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="container-narrow pt-4">
        <Breadcrumbs
          items={[
            { label: 'Tạp chí', href: '/bai-viet' },
            { label: article.title },
          ]}
        />

        {/* Article Header */}
        <header className="mt-4 mb-8 text-center space-y-4">
          {article.categoryName && (
            <span className="inline-block rounded-full bg-brand-50 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-luxury-gold">
              {article.categoryName}
            </span>
          )}
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-luxury-black tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-y border-gray-100 py-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <User className="h-3.5 w-3.5 text-luxury-gold" />
              {article.authorName || 'LUXE Editorial'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-luxury-gold" />
              {article.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-luxury-gold" />
              {article.readingTime || '5 phút đọc'}
            </span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[16/10] sm:aspect-[21/10] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-luxury mb-10">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-sans text-sm sm:text-base space-y-6">
          <p className="text-base sm:text-lg font-serif italic text-slate-800 leading-relaxed border-l-2 border-luxury-gold pl-4 py-1">
            {article.excerpt}
          </p>

          <div className="whitespace-pre-line leading-loose text-justify">
            {article.content}
          </div>
        </div>

        {/* Tags & Share */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Chủ đề:
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-2xs font-medium text-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Share2 className="h-4 w-4 text-luxury-gold" />
            <span>Chia sẻ bài viết</span>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-100">
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-8">
              Bài Viết Liên Quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((art) => (
                <Link
                  key={art.id}
                  href={`/bai-viet/${art.slug}`}
                  className="group block space-y-3"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
                    <Image
                      src={art.featuredImage}
                      alt={art.title}
                      fill
                      sizes="300px"
                      className="object-cover transition-transform duration-500 ease-luxury group-hover:scale-105"
                    />
                  </div>
                  <span className="text-2xs font-semibold uppercase tracking-wider text-luxury-gold">
                    {art.categoryName}
                  </span>
                  <h4 className="font-serif text-sm font-bold text-slate-900 group-hover:text-luxury-gold transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
