'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductCard } from '@/components/store/product-card';
import { SAMPLE_PRODUCTS } from '@/lib/sample-data';
import { toast } from '@/components/ui/toast';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';

const AVAILABLE_COUPONS = [
  { code: 'LUXE10', name: 'Giảm 10% đơn hàng từ 3.000.000đ', discountType: 'percentage' as const, discountValue: 10, minOrderAmount: 3000000, maxDiscount: 1000000 },
  { code: 'LUXEVIP', name: 'Giảm 500.000đ đơn hàng từ 5.000.000đ', discountType: 'fixed_amount' as const, discountValue: 500000, minOrderAmount: 5000000 },
  { code: 'FREESHIP', name: 'Miễn phí vận chuyển toàn quốc', discountType: 'free_shipping' as const, discountValue: 40000, minOrderAmount: 1000000 },
];

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const shippingFee = subtotal >= 2000000 || subtotal === 0 || coupon?.discountType === 'free_shipping' ? 0 : 40000;
  const finalTotal = getTotal();

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    const found = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (!found) {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      return;
    }

    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      toast.warning(`Mã ${found.code} chỉ áp dụng cho đơn từ ${formatPrice(found.minOrderAmount)}`);
      return;
    }

    applyCoupon(found);
    setCouponInput('');
    toast.success(`Đã áp dụng mã ưu đãi ${found.code}!`);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.id);
      toast.info(`Đã xóa "${itemToDelete.name}" khỏi giỏ hàng`);
      setItemToDelete(null);
    }
  };

  const relatedProducts = SAMPLE_PRODUCTS.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50/40 pb-24">
      <div className="container-luxe pt-4">
        <Breadcrumbs items={[{ label: 'Giỏ hàng' }]} />

        <div className="mt-2 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight">
            Giỏ Hàng Của Bạn
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {items.length > 0
              ? `Bạn có ${items.length} mặt hàng thượng hạng đang sẵn sàng thanh toán`
              : 'Giỏ hàng hiện đang trống'}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm max-w-xl mx-auto my-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-luxury-gold mb-6 shadow-glow">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Chưa có sản phẩm nào trong giỏ
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Khám phá các bộ sưu tập thời trang thiết kế mới nhất để chọn lựa những tuyệt tác phù hợp với phong cách của bạn.
            </p>
            <div className="mt-8">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 rounded-xl bg-luxury-black px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-luxury-lg hover:bg-luxury-black-light transition-all"
              >
                <span>Khám phá sản phẩm ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Items & Order Summary Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="hidden sm:grid grid-cols-12 pb-4 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-2 text-center">Đơn giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Tổng cộng</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-5 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 transition-colors hover:bg-slate-50/50 rounded-xl px-2"
                    >
                      {/* Product details */}
                      <div className="sm:col-span-6 flex gap-4">
                        <Link
                          href={`/san-pham/${item.slug}`}
                          className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-gray-100"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex flex-col justify-between py-0.5">
                          <div>
                            <Link
                              href={`/san-pham/${item.slug}`}
                              className="font-serif text-sm font-semibold text-slate-900 hover:text-luxury-gold transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-2xs text-slate-500">
                              {item.color && (
                                <span className="rounded bg-slate-100 px-2 py-0.5">
                                  Màu: {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="rounded bg-slate-100 px-2 py-0.5">
                                  Cỡ: {item.size}
                                </span>
                              )}
                              <span>SKU: {item.sku}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setItemToDelete({ id: item.id, name: item.name })}
                            className="inline-flex items-center gap-1 text-2xs font-medium text-rose-500 hover:text-rose-700 transition-colors w-fit mt-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Xóa khỏi giỏ</span>
                          </button>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-2 flex sm:justify-center items-center gap-2">
                        <span className="sm:hidden text-xs text-slate-400">Đơn giá:</span>
                        <span className="text-xs font-semibold text-slate-800">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="sm:col-span-2 flex sm:justify-center items-center gap-2">
                        <span className="sm:hidden text-xs text-slate-400">Số lượng:</span>
                        <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="sm:col-span-2 flex sm:justify-end items-center gap-2">
                        <span className="sm:hidden text-xs text-slate-400">Tổng cộng:</span>
                        <span className="font-serif text-sm font-bold text-luxury-black">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <Link
                    href="/san-pham"
                    className="text-xs font-semibold text-slate-600 hover:text-luxury-gold flex items-center gap-1.5 transition-colors"
                  >
                    <span>← Tiếp tục mua sắm</span>
                  </Link>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Làm trống giỏ hàng
                  </button>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl bg-white p-5 border border-gray-100 shadow-sm text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-luxury-gold shrink-0" />
                  <span>Miễn phí vận chuyển cho đơn từ 2.000.000₫</span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-luxury-gold shrink-0" />
                  <span>15 ngày đổi trả mẫu mã, kích cỡ miễn phí</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-luxury-gold shrink-0" />
                  <span>Đảm bảo 100% lụa và da thật chính hãng</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:col-span-4 rounded-3xl border border-gray-100 bg-white p-6 sm:p-7 shadow-sm sticky top-24">
              <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-gray-100 pb-4">
                Tóm Tắt Đơn Hàng
              </h3>

              {/* Coupon Form */}
              <div className="mt-5 space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                  Mã ưu đãi / Voucher
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Nhập mã ưu đãi..."
                    className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs uppercase placeholder:normal-case focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="rounded-xl bg-luxury-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-luxury-black-light transition-all"
                  >
                    Áp dụng
                  </button>
                </div>

                {/* Available Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_COUPONS.map((cp) => (
                    <button
                      key={cp.code}
                      type="button"
                      onClick={() => handleApplyCoupon(cp.code)}
                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-luxury-gold/60 bg-brand-50/50 px-2 py-1 text-2xs font-semibold text-luxury-gold hover:bg-brand-50"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {cp.code}
                    </button>
                  ))}
                </div>

                {/* Active Coupon Badge */}
                {coupon && (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800 border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-semibold">{coupon.code}</span>
                      <span className="text-2xs text-emerald-600">({coupon.name})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="mt-6 space-y-3 pt-5 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Giảm giá ({coupon?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển dự tính</span>
                  <span className="font-semibold text-slate-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-2xs">Miễn phí</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between">
                  <span className="font-serif text-base font-bold text-slate-900">Tổng thanh toán</span>
                  <div className="text-right">
                    <span className="font-serif text-2xl font-bold text-luxury-black">
                      {formatPrice(finalTotal)}
                    </span>
                    <p className="text-2xs text-slate-400 mt-0.5">(Đã bao gồm VAT nếu có)</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={() => router.push('/thanh-toan')}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-luxury-black py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-luxury-lg hover:bg-luxury-black-light transition-all active:scale-[0.98]"
              >
                <span>Tiến hành đặt hàng</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Related / Recommended products */}
        <div className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-widest text-luxury-gold">
                KHÁM PHÁ THÊM
              </span>
              <h3 className="font-serif text-2xl font-bold text-luxury-black mt-1">
                Có Thể Bạn Sẽ Thích
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
      </div>

      {/* Delete Item Confirmation Modal */}
      <Modal open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <ModalContent size="default">
          <ModalHeader>
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <ModalTitle>Xác nhận xóa sản phẩm</ModalTitle>
            </div>
            <ModalDescription>
              Bạn có chắc chắn muốn bỏ mặt hàng &quot;{itemToDelete?.name}&quot; ra khỏi giỏ hàng của mình?
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <button
              type="button"
              onClick={() => setItemToDelete(null)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Giữ lại
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Xác nhận xóa
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
