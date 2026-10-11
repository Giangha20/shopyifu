'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const TRACKING_STEPS = [
  { id: 'pending', label: 'Đặt hàng thành công', desc: 'Đã nhận đơn' },
  { id: 'confirmed', label: 'Đã xác nhận', desc: 'Kiểm tra kho' },
  { id: 'preparing', label: 'Chuẩn bị quà', desc: 'Đóng gói thủ công' },
  { id: 'shipping', label: 'Đang vận chuyển', desc: 'Bàn giao Shipper' },
  { id: 'delivered', label: 'Đã giao hàng', desc: 'Hoàn tất' },
];

export default function OrderTrackingClient() {
  const searchParams = useSearchParams();
  const urlOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(urlOrderNumber);
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchOrder = (targetOrderNumber?: string) => {
    const num = (targetOrderNumber || orderNumber).trim();
    if (!num) {
      toast.error('Vui lòng nhập mã đơn hàng');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      // Check session storage first
      let order: any = null;
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(`order_${num}`);
        if (stored) {
          try {
            order = JSON.parse(stored);
          } catch {
            // ignore
          }
        }
      }

      // If not in session, generate realistic luxury tracking record
      if (!order) {
        order = {
          orderNumber: num,
          status: 'shipping',
          currentStepIndex: 3, // shipping
          createdAt: '10/10/2026',
          shippingName: 'Quý Khách Hàng',
          shippingPhone: phone || '0988 *** 999',
          shippingStreet: '15 Tràng Tiền, Hoàn Kiếm, Hà Nội',
          shippingMethod: 'LUXE Express Concierge',
          trackingCode: `VN-LX-${num.slice(-6)}`,
          paymentMethod: 'Chuyển khoản VietQR (Đã thanh toán)',
          totalAmount: 3850000,
          items: [
            {
              productName: 'Đầm Lụa Tơ Tằm Thắt Eo Hoàng Gia',
              variantName: 'Champagne / S',
              quantity: 1,
              unitPrice: 3850000,
              totalPrice: 3850000,
              productImage:
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
            },
          ],
        };
      } else {
        order.currentStepIndex = 1; // freshly placed order
      }

      setSearchedOrder(order);
      setIsSearching(false);
    }, 600);
  };

  useEffect(() => {
    if (urlOrderNumber) {
      searchOrder(urlOrderNumber);
    }
  }, [urlOrderNumber]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-narrow pt-4">
        <Breadcrumbs items={[{ label: 'Tra cứu đơn hàng' }]} />

        {/* Page Title */}
        <div className="mt-2 mb-10 text-center space-y-3">
          <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
            HÀNH TRÌNH ĐƠN HÀNG
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight">
            Tra Cứu Trạng Thái Đơn Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Nhập mã đơn hàng và số điện thoại mua hàng để theo dõi tiến độ vận chuyển chi tiết.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchOrder();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3"
          >
            <div className="sm:col-span-6">
              <label className="text-2xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Mã đơn hàng
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="VD: LX-LUXE-88992"
                className="h-12 w-full rounded-xl border border-gray-200 px-3.5 text-xs uppercase font-medium focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-2xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912 345 678"
                className="h-12 w-full rounded-xl border border-gray-200 px-3.5 text-xs font-medium focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isSearching}
                className="h-12 w-full rounded-xl bg-luxury-black text-xs font-bold uppercase tracking-wider text-white hover:bg-luxury-black-light transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                <span>{isSearching ? 'Tìm...' : 'Tra cứu'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Result Card */}
        {searchedOrder && (
          <div className="space-y-6">
            {/* Status Stepper */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-8">
                <div>
                  <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold block">
                    Đơn hàng #{searchedOrder.orderNumber}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    Mã vận đơn: <strong>{searchedOrder.trackingCode || 'Đang tạo'}</strong>
                  </span>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Đang giao hàng tận nơi
                </div>
              </div>

              {/* Progress Stepper Visual */}
              <div className="relative py-4">
                <div className="hidden sm:grid grid-cols-5 gap-2 text-center">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isDone = idx <= (searchedOrder.currentStepIndex || 2);
                    const isCurrent = idx === (searchedOrder.currentStepIndex || 2);
                    return (
                      <div key={step.id} className="relative flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                            isDone
                              ? 'border-luxury-gold bg-luxury-gold text-white shadow-glow'
                              : 'border-gray-200 bg-white text-slate-300'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <span
                          className={`mt-2.5 text-xs font-semibold ${
                            isCurrent
                              ? 'text-luxury-black font-bold'
                              : isDone
                              ? 'text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-2xs text-slate-400 mt-0.5">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile simplified timeline */}
                <div className="sm:hidden space-y-4">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isDone = idx <= (searchedOrder.currentStepIndex || 2);
                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            isDone ? 'bg-luxury-gold text-white' : 'bg-gray-100 text-slate-400'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                          <p className="text-2xs text-slate-400">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Details Breakdown */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-slate-900 border-b border-gray-100 pb-3">
                Chi Tiết Đơn Hàng
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Địa chỉ nhận hàng:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{searchedOrder.shippingName}</p>
                  <p className="text-slate-600">{searchedOrder.shippingStreet}</p>
                  <p className="text-slate-500">SĐT: {searchedOrder.shippingPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400 block">Hình thức vận chuyển:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{searchedOrder.shippingMethod}</p>
                  <span className="text-slate-400 block mt-2">Thanh toán:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{searchedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Sản phẩm trong hộp quà
                </span>
                {searchedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-gray-100">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-900 block">{item.productName}</span>
                        <span className="text-2xs text-slate-400">{item.variantName} (x{item.quantity})</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-100 flex items-baseline justify-between text-sm">
                  <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="font-serif text-lg font-bold text-luxury-black">
                    {formatPrice(searchedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasSearched && !searchedOrder && (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-slate-500">
            <AlertCircle className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <h3 className="font-serif text-lg font-bold text-slate-800">
              Không tìm thấy đơn hàng
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ Hotline 1900 888 999 để được nhân viên hỗ trợ trực tiếp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
