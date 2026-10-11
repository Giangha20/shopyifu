'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductItem } from '@/types/store';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/components/ui/toast';

export type { ProductItem };

interface ProductCardProps {
  product: ProductItem;
  viewMode?: 'grid' | 'list';
  onQuickView?: (product: ProductItem) => void;
}

export function ProductCard({ product, viewMode = 'grid', onQuickView }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCart();

  const isWishlisted = isInWishlist(product.id);

  const primaryImage =
    typeof product.images?.[0] === 'string'
      ? (product.images[0] as string)
      : (product.images?.[0] as any)?.url || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80';
  const secondaryImage =
    typeof product.images?.[1] === 'string'
      ? (product.images[1] as string)
      : (product.images?.[1] as any)?.url || primaryImage;

  const discount = product.compareAtPrice
    ? getDiscountPercentage(product.price, product.compareAtPrice)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!isWishlisted) {
      toast.success('Đã thêm vào danh sách yêu thích', {
        description: product.name,
      });
    } else {
      toast.info('Đã xóa khỏi danh sách yêu thích');
    }
  };

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant = product.variants?.[0];
    addItem({
      id: `${product.id}-${defaultVariant?.id || 'standard'}`,
      productId: product.id,
      variantId: defaultVariant?.id || null,
      name: product.name,
      slug: product.slug,
      sku: defaultVariant?.sku || product.sku,
      image: primaryImage,
      price: defaultVariant?.price ? Number(defaultVariant.price) : product.price,
      compareAtPrice: product.compareAtPrice,
      quantity: 1,
      variantName: defaultVariant?.name || null,
      color: defaultVariant?.color || null,
      size: defaultVariant?.size || null,
      stock: defaultVariant?.quantity || product.quantity,
    });

    toast.success('Đã thêm vào giỏ hàng', {
      description: `${product.name} (Số lượng: 1)`,
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col sm:flex-row gap-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-luxury-lg transition-all duration-300">
        {/* Product Image */}
        <Link
          href={`/san-pham/${product.slug}`}
          className="relative block w-full sm:w-56 h-64 sm:h-auto shrink-0 overflow-hidden rounded-xl bg-slate-50"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 240px"
            className="object-cover object-center transition-transform duration-700 ease-luxury group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
            {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
            {product.isNew && <Badge variant="new">Mới</Badge>}
            {product.isBestseller && <Badge variant="bestseller">Hot</Badge>}
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            {product.brand && (
              <span className="text-xs uppercase tracking-wider text-slate-600 font-medium">
                {product.brand}
              </span>
            )}
            <Link href={`/san-pham/${product.slug}`} className="mt-1 block group-hover:text-luxury-gold transition-colors">
              <h3 className="font-serif text-lg font-semibold text-slate-900 line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <div className="flex items-center text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                <span className="ml-1 font-semibold text-slate-800">
                  {(Number(product.avgRating) || 5.0).toFixed(1)}
                </span>
              </div>
              <span>•</span>
              <span>{product.reviewCount ?? 0} đánh giá</span>
              <span>•</span>
              <span className="text-slate-400">Đã bán {product.soldCount ?? 0}</span>
            </div>

            {/* Short Description */}
            <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {product.shortDescription || 'Sản phẩm thủ công cao cấp được chế tác tỉ mỉ từ vật liệu chọn lọc thượng hạng.'}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100">
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-xl font-bold text-luxury-black">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`rounded-lg p-2.5 transition-colors border ${
                  isWishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-500'
                    : 'border-gray-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
                aria-label="Thêm vào yêu thích"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleQuickAddToCart}
                className="inline-flex items-center gap-2 rounded-lg bg-luxury-black px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-luxury-black-light transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Thêm vào giỏ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (Default)
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1">
      {/* Product Image Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
        <Link href={`/san-pham/${product.slug}`} className="block h-full w-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-all duration-700 ease-luxury group-hover:scale-105"
          />
          {secondaryImage !== primaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} góc khác`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center opacity-0 transition-opacity duration-700 ease-luxury group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
          {product.isNew && <Badge variant="new">Mới</Badge>}
          {product.isBestseller && <Badge variant="bestseller">Hot</Badge>}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-transform active:scale-90 hover:scale-110 ${
            isWishlisted ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'
          }`}
          aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Floating Quick Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-luxury">
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-800 shadow-md hover:bg-slate-50 transition-colors"
              title="Xem nhanh"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleQuickAddToCart}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-luxury-black/95 text-white backdrop-blur-md py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-luxury-black shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Thêm giỏ hàng</span>
          </button>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <p className="text-2xs font-semibold uppercase tracking-widest text-slate-400">
            {product.brand}
          </p>
        )}
        <Link
          href={`/san-pham/${product.slug}`}
          className="mt-1 block font-serif text-sm sm:text-base font-semibold text-slate-900 group-hover:text-luxury-gold transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Rating summary */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <div className="flex items-center text-amber-500">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
            <span className="ml-1 font-medium text-slate-700">
              {(Number(product.avgRating) || 5.0).toFixed(1)}
            </span>
          </div>
          <span>•</span>
          <span className="text-slate-400">Đã bán {product.soldCount ?? 0}</span>
        </div>

        {/* Color swatches preview if variants have colors */}
        {product.variants && product.variants.length > 1 && (
          <div className="mt-2.5 flex items-center gap-1.5">
            {Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))).slice(0, 4).map((color, idx) => (
              <span
                key={idx}
                className="inline-block h-3 w-3 rounded-full border border-gray-300 bg-slate-300"
                title={color || ''}
                style={{
                  backgroundColor:
                    color?.toLowerCase().includes('champagne') ? '#E8D5B0' :
                    color?.toLowerCase().includes('đen') ? '#1A1A1A' :
                    color?.toLowerCase().includes('trắng') ? '#FAFAFA' :
                    color?.toLowerCase().includes('nâu') ? '#8A6339' :
                    color?.toLowerCase().includes('vàng') ? '#C9A96E' : '#94A3B8'
                }}
              />
            ))}
            {product.variants.length > 4 && (
              <span className="text-2xs text-slate-400 font-medium">+{product.variants.length - 4}</span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="font-serif text-base sm:text-lg font-bold text-luxury-black">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
