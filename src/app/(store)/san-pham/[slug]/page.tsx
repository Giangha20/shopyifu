import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProductBySlug } from '@/lib/api-client';
import ProductDetailClient from './product-detail-client';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);
  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | LUXE SHOP',
      description: 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.',
    };
  }

  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80';

  return {
    title: `${product.name} | LUXE SHOP`,
    description: product.shortDescription || `Mua ngay ${product.name} cao cấp chính hãng tại LUXE SHOP.`,
    openGraph: {
      title: `${product.name} - LUXE SHOP`,
      description: product.shortDescription || product.name,
      images: [{ url: primaryImage }],
      type: 'website',
    },
  };
}

function DetailLoadingSkeleton() {
  return (
    <div className="container-luxe py-8">
      <Skeleton className="h-4 w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.shortDescription || product.name,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'LUXE SHOP',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: product.price,
      availability:
        product.quantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://luxeshop.vn/san-pham/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: product.reviewCount || 1,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<DetailLoadingSkeleton />}>
        <ProductDetailClient initialProduct={product} />
      </Suspense>
    </>
  );
}
