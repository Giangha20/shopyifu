'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, RotateCcw, TrendingUp } from 'lucide-react';
import { ProductItem } from '@/types/store';
import { fetchProducts } from '@/lib/api-client';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductCard } from '@/components/store/product-card';
import { Skeleton } from '@/components/ui/skeleton';

const POPULAR_SEARCHES = [
  'Đầm lụa tơ tằm',
  'Áo khoác Tweed',
  'Túi xách Monaco da bê',
  'Khăn lụa tơ tằm',
  'Giày gót pha lê',
  'Sơ mi lụa cát',
];

export default function SearchClientView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSearchInput(query);
    setIsLoading(true);
    fetchProducts({ search: query, limit: 24 }).then((res) => {
      setProducts(res.products);
      setIsLoading(false);
    });
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleChipClick = (keyword: string) => {
    setSearchInput(keyword);
    router.push(`/tim-kiem?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-luxe pt-4">
        <Breadcrumbs
          items={[
            { label: 'Tìm kiếm' },
            ...(query ? [{ label: `"${query}"` }] : []),
          ]}
        />

        {/* Search Input Bar */}
        <div className="mt-4 mb-8 max-w-2xl mx-auto text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight mb-4">
            Tìm Kiếm Sản Phẩm
          </h1>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-luxury">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập tên sản phẩm, chất liệu, mã SKU..."
              className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-28 text-sm focus:border-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold/20"
            />
            <Search className="absolute left-4 h-5 w-5 text-slate-400" />
            <button
              type="submit"
              className="absolute right-2 rounded-xl bg-luxury-black px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-luxury-black-light transition-all"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Popular Search Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-slate-400">
              <TrendingUp className="h-3 w-3" /> Tìm kiếm phổ biến:
            </span>
            {POPULAR_SEARCHES.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleChipClick(kw)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-2xs font-medium text-slate-600 hover:border-luxury-gold hover:text-luxury-gold transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="text-sm text-slate-600">
            {query ? (
              <>
                Kết quả tìm kiếm cho:{' '}
                <strong className="text-slate-900">&quot;{query}&quot;</strong>{' '}
                <span className="text-slate-400">({products.length} sản phẩm)</span>
              </>
            ) : (
              <span>Tất cả các sản phẩm đề xuất</span>
            )}
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
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm max-w-lg mx-auto my-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-slate-800">
              Không tìm thấy kết quả nào
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Rất tiếc, chúng tôi không tìm thấy sản phẩm nào khớp với từ khóa &quot;{query}&quot;. Bạn vui lòng kiểm tra lại chính tả hoặc thử các từ khóa phổ biến bên dưới.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.slice(0, 3).map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleChipClick(kw)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
