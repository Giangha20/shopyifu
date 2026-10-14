'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 500000;

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setItemToDelete(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  const total = getTotal();
  const itemCount = getItemCount();
  const freeShippingDifference = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const freeShippingProgress = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-luxury-gold" />
                  <h2 className="text-lg font-serif font-bold text-luxury-black">
                    Giỏ hàng của bạn
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-luxury-black text-white">
                    {itemCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="rounded-full p-2 text-gray-400 hover:text-luxury-black hover:bg-gray-100 transition-colors"
                  aria-label="Đóng giỏ hàng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress */}
              <div className="px-6 py-3.5 bg-luxury-cream/40 border-b border-luxury-gold/15">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="flex items-center gap-1.5 text-luxury-black">
                    <Truck className="w-3.5 h-3.5 text-luxury-gold" />
                    {freeShippingDifference === 0 ? (
                      <span className="text-emerald-700 font-semibold">
                        Chúc mừng! Bạn được miễn phí vận chuyển
                      </span>
                    ) : (
                      <span>
                        Mua thêm{' '}
                        <strong className="text-luxury-gold font-bold">
                          {formatPrice(freeShippingDifference)}
                        </strong>{' '}
                        để được freeship
                      </span>
                    )}
                  </span>
                  <span className="text-gray-500 font-semibold">{freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-luxury-gold to-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items List or Empty State */}
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="w-20 h-20 rounded-full bg-luxury-cream flex items-center justify-center mb-5 text-luxury-gold">
                      <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-luxury-black mb-2">
                      Giỏ hàng đang trống
                    </h3>
                    <p className="text-sm text-slate-500 max-w-xs mb-6">
                      Bạn chưa chọn sản phẩm nào. Hãy khám phá những tuyệt tác thời trang mới nhất của chúng tôi!
                    </p>
                    <button
                      type="button"
                      onClick={closeCart}
                      className="btn-primary text-sm px-6 py-2.5 rounded-lg shadow-sm inline-flex items-center gap-2"
                    >
                      <span>Tiếp tục mua sắm</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 items-start group">
                      {/* Item Image */}
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.productId}`}
                            onClick={closeCart}
                            className="font-medium text-sm text-luxury-black hover:text-luxury-gold transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item.id)}
                            className="text-gray-400 hover:text-rose-500 p-1 transition-colors rounded"
                            title="Xóa sản phẩm"
                            aria-label={`Xóa ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.variantName && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Phân loại: <span className="font-medium text-slate-700">{item.variantName}</span>
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-semibold text-sm text-luxury-black">
                            {formatPrice(item.price)}
                          </span>

                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-200 rounded-md bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-gray-500 hover:text-luxury-black transition-colors"
                              aria-label="Giảm số lượng"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold text-slate-800 min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-gray-500 hover:text-luxury-black transition-colors"
                              aria-label="Tăng số lượng"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Confirmation prompt inline */}
                        {itemToDelete === item.id && (
                          <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs flex items-center justify-between">
                            <span className="text-rose-700 font-medium">Xác nhận bỏ sản phẩm này?</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  removeItem(item.id);
                                  setItemToDelete(null);
                                }}
                                className="px-2 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 transition-colors"
                              >
                                Xóa
                              </button>
                              <button
                                type="button"
                                onClick={() => setItemToDelete(null)}
                                className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                              >
                                Giữ
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Section */}
              {items.length > 0 && (
                <div className="p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-slate-50 border-t border-gray-200 space-y-4">
                  {/* Summary */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Tạm tính</span>
                      <span className="font-medium text-slate-900">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Phí vận chuyển</span>
                      <span>
                        {total >= FREE_SHIPPING_THRESHOLD ? (
                          <span className="text-emerald-600 font-semibold uppercase text-xs">
                            Miễn phí
                          </span>
                        ) : (
                          formatPrice(30000)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-luxury-black pt-2 border-t border-gray-200">
                      <span>Tổng cộng</span>
                      <span className="text-lg text-luxury-black font-serif">
                        {formatPrice(total >= FREE_SHIPPING_THRESHOLD ? total : total + 30000)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5">
                    <Link
                      href="/thanh-toan"
                      onClick={closeCart}
                      className="btn-primary w-full text-center justify-center py-3.5 shadow-md flex items-center gap-2"
                    >
                      <span>Tiến hành thanh toán</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={closeCart}
                      className="w-full text-center text-xs text-slate-600 hover:text-luxury-black font-medium transition-colors py-1"
                    >
                      ← Tiếp tục mua sắm
                    </button>
                  </div>

                  {/* Trust guarantees */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 border-t border-gray-200/60">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                      <span>100% Chính hãng</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
                      <span>Đổi trả 30 ngày</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
