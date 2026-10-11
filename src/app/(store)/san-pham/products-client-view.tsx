'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ChevronDown,
  Star,
  RotateCcw,
  Search,
} from 'lucide-react';
import { ProductItem, ProductCategory } from '@/types/store';
import { fetchProducts, fetchCategories } from '@/lib/api-client';
import { ProductCard } from '@/components/store/product-card';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestselling', label: 'Bán chạy nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'discount', label: 'Khuyến mãi khủng' },
];

const BRANDS = ['LUXE Atelier', 'LUXE Leathercraft'];
const COLORS = [
  { label: 'Champagne', hex: '#E8D5B0' },
  { label: 'Đen', hex: '#1A1A1A' },
  { label: 'Trắng Ngà', hex: '#FAFAFA' },
  { label: 'Nâu Caramel', hex: '#8A6339' },
  { label: 'Vàng Cung Đình', hex: '#C9A96E' },
];
const SIZES = ['S', 'M', 'L', '36', '37', '38', 'One Size'];

export default function ProductsClientView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL state
  const currentCategory = searchParams.get('category') || searchParams.get('cat') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page') || '1');
  const currentColor = searchParams.get('color') || '';
  const currentSize = searchParams.get('size') || '';
  const currentRating = Number(searchParams.get('rating') || '0');
  const currentMinPrice = Number(searchParams.get('minPrice') || '0');
  const currentMaxPrice = Number(searchParams.get('maxPrice') || '10000000');
  const currentSearch = searchParams.get('q') || searchParams.get('search') || '';

  // Local UI states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([currentMinPrice, currentMaxPrice]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sync price range with URL changes
  useEffect(() => {
    setPriceRange([currentMinPrice, currentMaxPrice]);
  }, [currentMinPrice, currentMaxPrice]);

  // Load categories once
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Fetch products on query params change
  useEffect(() => {
    setIsLoading(true);
    fetchProducts({
      category: currentCategory,
      brand: currentBrand,
      sort: currentSort,
      page: currentPage,
      limit: 12,
      color: currentColor,
      size: currentSize,
      search: currentSearch || undefined,
      rating: currentRating > 0 ? currentRating : undefined,
      minPrice: currentMinPrice > 0 ? currentMinPrice : undefined,
      maxPrice: currentMaxPrice < 10000000 ? currentMaxPrice : undefined,
    }).then((res) => {
      setProducts(res.products);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
      setIsLoading(false);
    });
  }, [
    currentCategory,
    currentBrand,
    currentSort,
    currentPage,
    currentColor,
    currentSize,
    currentRating,
    currentMinPrice,
    currentMaxPrice,
    currentSearch,
  ]);

  // Helper to update search params
  const updateQuery = (paramsToUpdate: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(paramsToUpdate).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'all') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    if (!('page' in paramsToUpdate)) {
      params.set('page', '1');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
    setPriceRange([0, 10000000]);
  };

  const hasActiveFilters =
    currentCategory !== 'all' ||
    currentBrand !== 'all' ||
    currentColor !== '' ||
    currentSize !== '' ||
    currentRating > 0 ||
    currentMinPrice > 0 ||
    currentMaxPrice < 10000000;

  // Filter content component reused between desktop sidebar and mobile sheet
  const FilterContent = () => (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Danh mục sản phẩm
        </h4>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => updateQuery({ category: 'all' })}
            className={`flex w-full items-center justify-between py-1.5 text-xs transition-colors ${
              currentCategory === 'all'
                ? 'font-bold text-luxury-gold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Tất cả sản phẩm</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateQuery({ category: cat.slug })}
              className={`flex w-full items-center justify-between py-1.5 text-xs text-left transition-colors ${
                currentCategory === cat.slug
                  ? 'font-bold text-luxury-gold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Khoảng giá
          </h4>
          <span className="text-xs text-luxury-gold font-semibold">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </span>
        </div>
        <Slider
          min={0}
          max={10000000}
          step={200000}
          value={priceRange}
          onValueChange={(val) => setPriceRange(val)}
          onValueCommit={(val) =>
            updateQuery({ minPrice: val[0].toString(), maxPrice: val[1].toString() })
          }
          className="my-4"
        />
        <div className="flex justify-between text-2xs text-slate-400">
          <span>0₫</span>
          <span>10.000.000₫+</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Thương hiệu
        </h4>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
            >
              <Checkbox
                checked={currentBrand === brand}
                onCheckedChange={(checked) =>
                  updateQuery({ brand: checked ? brand : 'all' })
                }
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Màu sắc
        </h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const isSelected = currentColor.toLowerCase() === c.label.toLowerCase();
            return (
              <button
                key={c.label}
                type="button"
                onClick={() =>
                  updateQuery({ color: isSelected ? null : c.label })
                }
                className={`group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all ${
                  isSelected
                    ? 'border-luxury-gold bg-luxury-gold/10 font-medium text-luxury-gold'
                    : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-gray-300 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Kích cỡ
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => {
            const isSelected = currentSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => updateQuery({ size: isSelected ? null : size })}
                className={`h-8 min-w-[2rem] px-2 rounded-lg border text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-luxury-black bg-luxury-black text-white'
                    : 'border-gray-200 bg-white text-slate-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Đánh giá
        </h4>
        <div className="space-y-1.5">
          {[5, 4, 3].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() =>
                updateQuery({ rating: currentRating === stars ? null : stars.toString() })
              }
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                currentRating === stars ? 'bg-amber-50 font-medium text-amber-900' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < stars ? 'fill-amber-400 stroke-amber-400' : 'fill-slate-200 stroke-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span>Từ {stars} sao trở lên</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container-luxe pt-4">
        <Breadcrumbs items={[{ label: 'Sản phẩm' }]} />

        {/* Page Header */}
        <div className="mt-2 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight">
              Tất Cả Sản Phẩm
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Tinh hoa chế tác thượng lưu kết hợp cùng đường nét thanh lịch vượt thời gian.
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500">
            Hiển thị <span className="font-bold text-slate-900">{products.length}</span> trên tổng số{' '}
            <span className="font-bold text-slate-900">{totalCount}</span> sản phẩm
          </div>
        </div>

        {/* Mobile Filter Toggle & Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Bộ lọc {hasActiveFilters && '(Đang lọc)'}</span>
          </button>

          <div className="flex items-center gap-2">
            <select
              value={currentSort}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-100 text-luxury-black' : 'text-slate-400'
                }`}
                aria-label="Xem lưới"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-slate-100 text-luxury-black' : 'text-slate-400'
                }`}
                aria-label="Xem danh sách"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 border border-gray-200/80 shadow-sm">
            <span className="text-xs font-medium text-slate-500 mr-1">Bộ lọc đang chọn:</span>
            {currentCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-2xs font-semibold text-slate-800">
                Danh mục: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <button
                  type="button"
                  onClick={() => updateQuery({ category: 'all' })}
                  className="hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {currentBrand !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-2xs font-semibold text-slate-800">
                Thương hiệu: {currentBrand}
                <button
                  type="button"
                  onClick={() => updateQuery({ brand: 'all' })}
                  className="hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {currentColor && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-2xs font-semibold text-slate-800">
                Màu: {currentColor}
                <button
                  type="button"
                  onClick={() => updateQuery({ color: null })}
                  className="hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {currentSize && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-2xs font-semibold text-slate-800">
                Cỡ: {currentSize}
                <button
                  type="button"
                  onClick={() => updateQuery({ size: null })}
                  className="hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {currentRating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-2xs font-semibold text-slate-800">
                Từ {currentRating} sao
                <button
                  type="button"
                  onClick={() => updateQuery({ rating: null })}
                  className="hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(currentMinPrice > 0 || currentMaxPrice < 10000000) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-2xs font-semibold text-slate-800">
                Giá: {formatPrice(currentMinPrice)} - {formatPrice(currentMaxPrice)}
                <button
                  type="button"
                  onClick={() => updateQuery({ minPrice: null, maxPrice: null })}
                  className="hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}

        {/* Main Grid & Desktop Sidebar */}
        <div className="flex gap-8 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sticky top-24">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <span className="font-serif font-bold text-sm tracking-wide text-slate-900">
                BỘ LỌC TÌM KIẾM
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-2xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Đặt lại
                </button>
              )}
            </div>
            <FilterContent />
          </aside>

          {/* Product Listing Section */}
          <div className="flex-1">
            {/* Desktop Sort & View controls */}
            <div className="hidden lg:flex items-center justify-between mb-6 rounded-xl bg-white p-3 border border-gray-200/80 shadow-sm">
              <span className="text-xs text-slate-500">
                Hiển thị kết quả tốt nhất
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Sắp xếp:</span>
                  <select
                    value={currentSort}
                    onChange={(e) => updateQuery({ sort: e.target.value })}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-gray-300 focus:outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="h-4 w-px bg-gray-200" />

                <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`rounded p-1 transition-colors ${
                      viewMode === 'grid' ? 'bg-slate-100 text-luxury-black' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    aria-label="Xem dạng lưới"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`rounded p-1 transition-colors ${
                      viewMode === 'list' ? 'bg-slate-100 text-luxury-black' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    aria-label="Xem dạng danh sách"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Render */}
            {isLoading || isPending ? (
              <div
                className={`grid gap-5 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white p-3 space-y-3">
                    <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-slate-800">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  Hãy thử điều chỉnh bộ lọc hoặc xóa các tiêu chí chọn để khám phá thêm nhiều thiết kế khác.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-luxury-black px-6 py-2.5 text-xs font-semibold text-white hover:bg-luxury-black-light transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Xóa tất cả bộ lọc</span>
                </button>
              </div>
            ) : (
              /* Products Grid or List */
              <div
                className={`grid gap-5 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3'
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => updateQuery({ page: (currentPage - 1).toString() })}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = pNum === currentPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => updateQuery({ page: pNum.toString() })}
                      className={`h-9 w-9 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-luxury-black text-white shadow-md'
                          : 'border border-gray-200 bg-white text-slate-700 hover:border-gray-300'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateQuery({ page: (currentPage + 1).toString() })}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <span className="font-serif text-lg font-bold text-slate-900">
                Bộ Lọc Sản Phẩm
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FilterContent />

            <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-luxury-black py-3 text-xs font-semibold text-white hover:bg-luxury-black-light"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
