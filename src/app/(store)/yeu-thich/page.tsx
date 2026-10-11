'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductCard } from '@/components/store/product-card';
import { SAMPLE_PRODUCTS } from '@/lib/sample-data';
import { toast } from '@/components/ui/toast';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleMoveToCart = (product: any) => {
    addItem({
      id: `${product.id}-standard`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images?.[0]?.url || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity: 1,
      stock: product.quantity || 10,
    });
    removeItem(product.id);
    toast.success('Đã chuyển sản phẩm vào giỏ hàng!', {
      description: product.name,
    });
  };

  const recommendedProducts = SAMPLE_PRODUCTS.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-luxe pt-4">
        <Breadcrumbs items={[{ label: 'Danh sách yêu thích' }]} />

        <div className="mt-2 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight">
              Sản Phẩm Yêu Thích
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Lưu giữ những thiết kế bạn say đắm để sở hữu khi sẵn sàng.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors self-start sm:self-auto"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm max-w-lg mx-auto my-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-6 shadow-glow">
              <Heart className="h-10 w-10 stroke-[2]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Danh sách yêu thích đang trống
            </h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Hãy nhấn biểu tượng trái tim ở góc mỗi sản phẩm để lưu lại những mẫu thiết kế bạn ưng ý nhất.
            </p>
            <div className="mt-8">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 rounded-xl bg-luxury-black px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-luxury-lg hover:bg-luxury-black-light transition-all"
              >
                <span>Khám phá bộ sưu tập</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-luxury-lg"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
                  <Link href={`/san-pham/${product.slug}`} className="block h-full w-full">
                    <Image
                      src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-md backdrop-blur-md hover:scale-110 transition-transform"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    {product.brand || 'LUXE Atelier'}
                  </span>
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="mt-1 font-serif text-sm font-semibold text-slate-900 group-hover:text-luxury-gold transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>

                  <div className="mt-auto pt-3 flex items-baseline justify-between">
                    <span className="font-serif text-base font-bold text-luxury-black">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-luxury-black py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-luxury-black-light transition-all"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Thêm vào giỏ hàng</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Products */}
        <div className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-widest text-luxury-gold">
                GỢI Ý TỪ CHUYÊN GIA
              </span>
              <h3 className="font-serif text-2xl font-bold text-luxury-black mt-1">
                Sản Phẩm Đang Được Yêu Thích Nhất
              </h3>
            </div>
            <Link
              href="/san-pham"
              className="text-xs font-semibold text-luxury-gold hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
