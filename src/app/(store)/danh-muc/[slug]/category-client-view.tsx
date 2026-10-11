'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid, List, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ProductCategory, ProductItem } from '@/types/store';
import { fetchProducts } from '@/lib/api-client';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductCard } from '@/components/store/product-card';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryClientViewProps {
  category: ProductCategory;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestselling', label: 'Bán chạy nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

export default function CategoryClientView({ category }: CategoryClientViewProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setIsLoading(true);
    fetchProducts({
      category: category.slug,
      sort,
      limit: 20,
    }).then((res) => {
      setProducts(res.products);
      setIsLoading(false);
    });
  }, [category.slug, sort]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-luxe pt-4">
        <Breadcrumbs
          items={[
            { label: 'Danh mục', href: '/san-pham' },
            { label: category.name },
          ]}
        />

        {/* Category Hero Banner */}
        <div className="relative mt-2 mb-10 overflow-hidden rounded-3xl bg-luxury-black text-white shadow-luxury-xl">
          {category.image && (
            <div className="absolute inset-0">
              <Image
                src={category.image}
                alt={category.name}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover opacity-40 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          )}

          <div className="relative z-10 p-8 sm:p-14 max-w-2xl">
            <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
              BỘ SƯU TẬP CAO CẤP
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              {category.name}
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {category.description ||
                'Chắt lọc từ những chất liệu tinh túy nhất với đường nét cắt may thủ công thượng thặng.'}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-gray-100 shadow-sm">
          <div className="text-xs font-semibold text-slate-700">
            Tìm thấy <span className="text-luxury-gold font-bold">{products.length}</span> sản phẩm
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                }`}
                aria-label="Xem lưới"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                }`}
                aria-label="Xem danh sách"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Render */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <h3 className="font-serif text-xl font-semibold text-slate-800">
              Chưa có sản phẩm trong danh mục này
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Vui lòng quay lại sau hoặc khám phá các danh mục thời trang khác của LUXE.
            </p>
            <Link
              href="/san-pham"
              className="mt-6 inline-flex rounded-xl bg-luxury-black px-6 py-2.5 text-xs font-semibold text-white"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <div
            className={`grid gap-5 ${
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
