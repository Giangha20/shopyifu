import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCategoryBySlug } from '@/lib/api-client';
import CategoryClientView from './category-client-view';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await fetchCategoryBySlug(params.slug);
  if (!category) {
    return {
      title: 'Không tìm thấy danh mục | LUXE SHOP',
      description: 'Danh mục sản phẩm không tồn tại.',
    };
  }

  return {
    title: `${category.name} | LUXE SHOP`,
    description: category.description || `Bộ sưu tập ${category.name} cao cấp độc quyền tại LUXE SHOP.`,
    openGraph: {
      title: `${category.name} - LUXE SHOP`,
      description: category.description || category.name,
      images: category.image ? [{ url: category.image }] : [],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await fetchCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="container-luxe py-8">
          <Skeleton className="h-64 w-full rounded-3xl mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <CategoryClientView category={category} />
    </Suspense>
  );
}
