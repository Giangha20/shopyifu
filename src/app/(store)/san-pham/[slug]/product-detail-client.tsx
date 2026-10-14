'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingBag,
  Share2,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Copy,
  Minus,
  Plus,
  ArrowRight,
  Sparkles,
  Shirt,
  Calendar,
} from 'lucide-react';
import { ProductItem } from '@/types/store';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductCard } from '@/components/store/product-card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toast } from '@/components/ui/toast';
import { SAMPLE_PRODUCTS } from '@/lib/sample-data';

interface ProductDetailClientProps {
  initialProduct: ProductItem;
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const router = useRouter();
  const product = initialProduct;

  const { addItem } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  // Variants state
  const colors = Array.from(new Set(product.variants?.map((v) => v.color).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(product.variants?.map((v) => v.size).filter(Boolean))) as string[];

  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Active Variant lookup
  const activeVariant = product.variants?.find(
    (v) =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedSize || v.size === selectedSize)
  ) || product.variants?.[0];

  const currentPrice = activeVariant?.price ? Number(activeVariant.price) : product.price;
  const discount = product.compareAtPrice
    ? getDiscountPercentage(currentPrice, product.compareAtPrice)
    : 0;

  // Track recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState<ProductItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('luxe_recently_viewed');
      let list: string[] = stored ? JSON.parse(stored) : [];
      list = list.filter((id) => id !== product.id);
      list.unshift(product.id);
      if (list.length > 8) list.pop();
      localStorage.setItem('luxe_recently_viewed', JSON.stringify(list));

      // Resolve items
      const resolved = list
        .filter((id) => id !== product.id)
        .map((id) => SAMPLE_PRODUCTS.find((p) => p.id === id))
        .filter(Boolean) as ProductItem[];
      setRecentlyViewed(resolved.slice(0, 4));
    } catch {
      // silent ignore
    }
  }, [product.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: `${product.id}-${activeVariant?.id || 'standard'}`,
      productId: product.id,
      variantId: activeVariant?.id || null,
      name: product.name,
      slug: product.slug,
      sku: activeVariant?.sku || product.sku,
      image: product.images[selectedImageIndex]?.url || product.images[0]?.url,
      price: currentPrice,
      compareAtPrice: product.compareAtPrice,
      quantity,
      variantName: activeVariant?.name || null,
      color: selectedColor || null,
      size: selectedSize || null,
      stock: activeVariant?.quantity || product.quantity,
    });

    toast.success('Đã thêm vào giỏ hàng', {
      description: `${product.name} (x${quantity})`,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/thanh-toan');
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết sản phẩm!');
    }
  };

  const relatedProducts = SAMPLE_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50/40 pb-24">
      <div className="container-luxe pt-4">
        {/* Breadcrumb navigation */}
        <Breadcrumbs
          items={[
            { label: 'Sản phẩm', href: '/san-pham' },
            ...(product.categories?.[0]
              ? [
                  {
                    label: product.categories[0].category.name,
                    href: `/danh-muc/${product.categories[0].category.slug}`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        {/* Product Details Section */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100 cursor-crosshair border border-gray-100"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <Image
                src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
                alt={product.images[selectedImageIndex]?.alt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={`object-cover object-center transition-transform duration-200 ${
                  isZoomed ? 'scale-150 origin-center' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : undefined
                }
              />

              {/* Badges on main image */}
              <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
                {discount > 0 && <Badge variant="sale">Giảm {discount}%</Badge>}
                {product.isNew && <Badge variant="new">Mới ra mắt</Badge>}
                {product.isBestseller && <Badge variant="bestseller">Bán chạy</Badge>}
              </div>

              {/* Wishlist Button floating on image */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md transition-all active:scale-95 ${
                  isWishlisted ? 'text-rose-500' : 'text-slate-700 hover:text-rose-500'
                }`}
                aria-label="Yêu thích"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-luxury-gold shadow-md scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `Ảnh ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Brand & SKU */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
                <span className="font-semibold uppercase tracking-widest text-luxury-gold">
                  {product.brand || 'LUXE Atelier'}
                </span>
                <span>SKU: {activeVariant?.sku || product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black tracking-tight mt-1 leading-snug">
                {product.name}
              </h1>

              {/* Rating & Sold count */}
              <div className="mt-3 flex items-center gap-3 text-xs">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(Number(product.avgRating) || 5)
                          ? 'fill-amber-400 stroke-amber-400'
                          : 'fill-slate-200 stroke-slate-200'
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 font-bold text-slate-800">
                    {(Number(product.avgRating) || 5.0).toFixed(1)}
                  </span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 underline cursor-pointer">{product.reviewCount ?? 0} Đánh giá</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500">Đã bán {product.soldCount ?? 0}</span>
              </div>

              {/* Price section */}
              <div className="mt-5 flex items-baseline gap-3 rounded-2xl bg-slate-50/80 p-4 border border-gray-100">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
                  {formatPrice(currentPrice)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <>
                    <span className="text-sm sm:text-base text-slate-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                      Tiết kiệm {formatPrice(product.compareAtPrice - currentPrice)}
                    </span>
                  </>
                )}
              </div>

              {/* Short description */}
              {product.shortDescription && (
                <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Color variant selector */}
              {colors.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-800 mb-2.5">
                    <span>Màu sắc:</span>
                    <span className="text-luxury-gold font-bold">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c) => {
                      const isSelected = selectedColor === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-luxury-black bg-luxury-black text-white shadow-sm'
                              : 'border-gray-200 bg-white text-slate-700 hover:border-gray-300'
                          }`}
                        >
                          <span
                            className="h-3 w-3 rounded-full border border-gray-300"
                            style={{
                              backgroundColor:
                                c.toLowerCase().includes('champagne') ? '#E8D5B0' :
                                c.toLowerCase().includes('đen') ? '#1A1A1A' :
                                c.toLowerCase().includes('trắng') ? '#FAFAFA' :
                                c.toLowerCase().includes('nâu') ? '#8A6339' :
                                c.toLowerCase().includes('vàng') ? '#C9A96E' : '#94A3B8'
                            }}
                          />
                          <span>{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size variant selector */}
              {sizes.length > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-800 mb-2.5">
                    <span>Kích thước:</span>
                    <span className="text-luxury-gold font-bold">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`h-10 min-w-[2.75rem] px-3 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-luxury-gold bg-luxury-gold text-white shadow-glow'
                              : 'border-gray-200 bg-white text-slate-700 hover:border-gray-400'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                  Số lượng:
                </span>
                <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.quantity || 99, q + 1))}
                    disabled={quantity >= (product.quantity || 99)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  {product.quantity > 0 ? `(Còn ${product.quantity} sản phẩm)` : '(Hết hàng)'}
                </span>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0 || isAdding}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-luxury-black bg-white px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-luxury-black hover:bg-slate-50 transition-all shadow-sm"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.quantity <= 0}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-luxury-black px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-luxury-black-light transition-all shadow-luxury-lg"
                >
                  <span>Mua ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>

              {/* RENTAL CTA BANNER */}
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-luxury-gold/30 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-luxury-gold text-white flex items-center justify-center shrink-0">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-luxury-black flex items-center gap-1.5">
                      <span>Dịch vụ Thuê Trang Phục</span>
                      <span className="badge-gold text-[9px] px-1.5 py-0.2">Tiết kiệm 85%</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Thuê từ{' '}
                      <strong className="text-rose-600">
                        {formatPrice(
                          (product as any).rentalPricePerDay
                            ? Number((product as any).rentalPricePerDay)
                            : Math.round(currentPrice * 0.15)
                        )}
                        /ngày
                      </strong>{' '}
                      · Hoàn cọc 100% khi trả
                    </div>
                  </div>
                </div>
                <Link
                  href="/thue-do"
                  className="btn-gold py-2 px-3.5 text-xs font-bold rounded-xl whitespace-nowrap shadow-sm hover:shadow flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Đặt thuê</span>
                </Link>
              </div>

              {/* Share & Guarantees */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Share2 className="h-3.5 w-3.5 text-luxury-gold" />
                    Chia sẻ sản phẩm:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-2xs hover:bg-slate-50 font-medium text-slate-600 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Sao chép liên kết
                    </button>
                  </div>
                </div>

                {/* Benefits Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-xs py-3">
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-luxury-gold" />
                        Chính sách giao hàng hỏa tốc toàn quốc
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-slate-600">
                      Miễn phí vận chuyển cho đơn hàng từ 2.000.000₫. Giao hỏa tốc 2 giờ tại nội thành Hà Nội & TP. Hồ Chí Minh. Các tỉnh thành khác nhận hàng từ 1-3 ngày làm việc trong hộp quà LUXE sang trọng.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="return">
                    <AccordionTrigger className="text-xs py-3">
                      <span className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-luxury-gold" />
                        Đổi trả miễn phí trong 15 ngày
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-slate-600">
                      Hỗ trợ đổi kích cỡ hoặc đổi mẫu tận nhà hoàn toàn miễn phí trong vòng 15 ngày kể từ ngày nhận hàng khi sản phẩm còn nguyên tem mác và hóa đơn mua hàng.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="authenticity">
                    <AccordionTrigger className="text-xs py-3">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-luxury-gold" />
                        Cam kết chất lượng 100% chính hãng
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-slate-600">
                      Tất cả sản phẩm đều đi kèm thẻ chứng nhận nghệ nhân độc quyền từ LUXE Atelier. Đền gấp 10 lần giá trị nếu phát hiện vật liệu kém chất lượng.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <div className="mt-14 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
          <Tabs defaultValue="description">
            <TabsList className="mb-6 w-full justify-start border-b border-gray-100 bg-transparent p-0 gap-6">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent px-2 pb-3 font-serif text-base sm:text-lg font-semibold data-[state=active]:border-luxury-gold data-[state=active]:text-luxury-black data-[state=active]:shadow-none"
              >
                Mô Tả Chi Tiết
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="rounded-none border-b-2 border-transparent px-2 pb-3 font-serif text-base sm:text-lg font-semibold data-[state=active]:border-luxury-gold data-[state=active]:text-luxury-black data-[state=active]:shadow-none"
              >
                Thông Số Kỹ Thuật
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent px-2 pb-3 font-serif text-base sm:text-lg font-semibold data-[state=active]:border-luxury-gold data-[state=active]:text-luxury-black data-[state=active]:shadow-none"
              >
                Đánh Giá ({product.reviews?.length || product.reviewCount || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <div className="whitespace-pre-line font-sans">
                {product.description || product.shortDescription}
              </div>
            </TabsContent>

            <TabsContent value="specs">
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100 bg-slate-50/50">
                      <td className="w-1/3 py-3 px-4 font-semibold text-slate-800">Thương hiệu</td>
                      <td className="py-3 px-4 text-slate-600">{product.brand || 'LUXE Atelier'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="w-1/3 py-3 px-4 font-semibold text-slate-800">Mã SKU</td>
                      <td className="py-3 px-4 text-slate-600">{product.sku}</td>
                    </tr>
                    {product.attributes?.map((att, idx) => (
                      <tr key={idx} className="border-b border-gray-100 even:bg-slate-50/50">
                        <td className="w-1/3 py-3 px-4 font-semibold text-slate-800">{att.name}</td>
                        <td className="py-3 px-4 text-slate-600">{att.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-100 pb-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">{rev.userName}</span>
                          {rev.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-2xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                              <Check className="h-3 w-3" /> Đã mua hàng
                            </span>
                          )}
                        </div>
                        <span className="text-2xs text-slate-400">{rev.createdAt}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 stroke-amber-400'
                                : 'fill-slate-200 stroke-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      {rev.title && <h5 className="text-xs font-bold text-slate-800">{rev.title}</h5>}
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-sm">
                    Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm!
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-2xs font-semibold uppercase tracking-widest text-luxury-gold">
                  GỢI Ý RIÊNG CHO BẠN
                </span>
                <h3 className="font-serif text-2xl font-bold text-luxury-black mt-1">
                  Sản Phẩm Tương Tự
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
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif text-xl font-bold text-luxury-black mb-6">
              Sản Phẩm Vừa Xem
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Add-to-Cart Bar */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Giá bán</span>
          <span className="font-serif text-base font-bold text-luxury-black truncate block">
            {formatPrice(currentPrice)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.quantity <= 0 || isAdding}
            className="px-3.5 py-2.5 rounded-xl border border-luxury-black bg-white text-luxury-black text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAdding ? '...' : 'Thêm giỏ'}</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.quantity <= 0}
            className="px-4 py-2.5 rounded-xl bg-luxury-black text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>Mua ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
