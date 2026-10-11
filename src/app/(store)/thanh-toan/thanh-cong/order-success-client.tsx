'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Truck,
  ArrowRight,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  QrCode,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { useStoreSettings } from '@/hooks/use-settings';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'LX-LUXE-88992';

  const [orderData, setOrderData] = useState<any>(null);
  const { settings, fetchSettings, isLoaded: isSettingsLoaded } = useStoreSettings();

  useEffect(() => {
    if (!isSettingsLoaded) {
      fetchSettings();
    }
  }, [isSettingsLoaded, fetchSettings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`order_${orderNumber}`);
      if (stored) {
        try {
          setOrderData(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(orderNumber);
      toast.success('Đã sao chép mã đơn hàng!');
    }
  };

  // Delivery estimation (3 business days ahead)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(deliveryDate);

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 sm:py-16">
      <div className="container-narrow">
        {/* Animated Checkmark Hero */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-glow mb-6"
          >
            <CheckCircle2 className="h-12 w-12 stroke-[2.5]" />
          </motion.div>

          <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">
            ĐẶT HÀNG THÀNH CÔNG
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight">
            Cảm Ơn Quý Khách Đã Lựa Chọn LUXE
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Đơn hàng của bạn đã được tiếp nhận và đang được xưởng chuẩn bị, đóng gói thủ công trong hộp quà LUXE sang trọng.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 sm:p-9 shadow-sm space-y-6">
          {/* Order Number Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-brand-50/50 p-4 border border-luxury-gold/30">
            <div>
              <span className="text-2xs uppercase tracking-wider text-slate-500 font-semibold block">
                Mã số đơn hàng
              </span>
              <span className="font-serif text-lg font-bold text-slate-900 tracking-wide">
                {orderNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={copyOrderNumber}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm border border-gray-200 hover:bg-slate-50 transition-colors"
            >
              <Copy className="h-3.5 w-3.5 text-luxury-gold" />
              <span>Sao chép mã</span>
            </button>
          </div>

          {/* Delivery & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1 text-xs">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-800">
                <Calendar className="h-4 w-4 text-luxury-gold" />
                Thời gian giao hàng dự kiến
              </span>
              <p className="text-slate-600 font-medium pl-5.5">{formattedDelivery}</p>
              <p className="text-2xs text-slate-400 pl-5.5">Đơn hàng được giao bởi LUXE Concierge Service</p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-800">
                <CreditCard className="h-4 w-4 text-luxury-gold" />
                Phương thức thanh toán
              </span>
              <p className="text-slate-600 font-medium pl-5.5">
                {orderData?.paymentMethod === 'bank_transfer'
                  ? 'Chuyển khoản Ngân hàng (VietQR)'
                  : orderData?.paymentMethod === 'vnpay'
                  ? 'Cổng thanh toán VNPay'
                  : 'Thanh toán tiền mặt khi nhận hàng (COD)'}
              </p>
              <p className="text-2xs text-slate-400 pl-5.5">Trạng thái: Chờ xác nhận</p>
            </div>

            {orderData?.shippingStreet && (
              <div className="sm:col-span-2 space-y-1 text-xs pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-800">
                  <MapPin className="h-4 w-4 text-luxury-gold" />
                  Địa chỉ nhận hàng
                </span>
                <p className="text-slate-600 pl-5.5">
                  <strong>{orderData.shippingName}</strong> ({orderData.shippingPhone})
                </p>
                <p className="text-slate-500 pl-5.5">
                  {orderData.shippingStreet}, {orderData.shippingWard}, {orderData.shippingDistrict}, {orderData.shippingProvince}
                </p>
              </div>
            )}
          </div>

          {/* Bank Transfer QR Code box if applicable */}
          {orderData?.paymentMethod === 'bank_transfer' && (() => {
            const bName = settings.bankName || 'MBBank';
            const bAcc = settings.bankAccountNumber || '8888 6666 9999';
            const bHolder = settings.bankAccountName || 'LUXE SHOP VIET NAM';
            
            let bCode = bName.trim().toUpperCase().replace(/\s+/g, '');
            if (bCode.includes('MB')) bCode = 'MB';
            else if (bCode.includes('VCB') || bCode.includes('VIETCOM')) bCode = 'VCB';
            else if (bCode.includes('TECH') || bCode.includes('TCB')) bCode = 'TCB';
            else if (bCode.includes('ACB')) bCode = 'ACB';
            else if (bCode.includes('BIDV')) bCode = 'BIDV';
            else if (bCode.includes('VIETIN') || bCode.includes('CTG')) bCode = 'CTG';
            else if (bCode.includes('TPB') || bCode.includes('TIENPHONG')) bCode = 'TPB';
            else if (bCode.includes('VPB') || bCode.includes('VPBANK')) bCode = 'VPB';

            const cleanAcc = bAcc.replace(/\s+/g, '');
            const transferAmount = orderData?.totalAmount || 0;
            const qrImageUrl = settings.paymentQrCode || `https://img.vietqr.io/image/${bCode}-${cleanAcc}-compact2.png?amount=${transferAmount}&addInfo=${encodeURIComponent(orderNumber)}&accountName=${encodeURIComponent(bHolder)}`;

            return (
              <div className="rounded-3xl border border-luxury-gold/50 bg-gradient-to-b from-brand-50/40 to-white p-6 sm:p-8 text-center space-y-5 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-gold/15 text-luxury-gold text-2xs font-bold uppercase tracking-wider mb-2">
                    <QrCode className="h-3.5 w-3.5" />
                    Mã Chuyển Khoản Tự Động VietQR
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Quét Mã Để Thanh Toán Đơn Hàng
                  </h3>
                  <p className="text-2xs sm:text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Mở ứng dụng Ngân hàng (App Banking) bất kỳ và quét mã bên dưới để tự động điền đúng số tiền và mã đơn hàng.
                  </p>
                </div>

                <div className="mx-auto w-56 p-3 bg-white rounded-2xl shadow-luxury-md border border-luxury-gold/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageUrl}
                    alt={`Mã QR đơn hàng ${orderNumber}`}
                    className="w-full h-auto object-contain rounded-xl"
                  />
                  <span className="block text-[11px] font-bold text-luxury-gold uppercase tracking-wider mt-2">
                    {bName} • NAPAS 247
                  </span>
                </div>

                <div className="max-w-md mx-auto rounded-2xl bg-white p-4 border border-gray-100 text-xs text-slate-700 space-y-2 text-left">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                    <span className="font-bold text-slate-900">{bName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{bAcc}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(bAcc);
                          toast.success('Đã sao chép số tài khoản!');
                        }}
                        className="text-luxury-gold hover:text-luxury-black transition-colors"
                        title="Sao chép số tài khoản"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-900 uppercase">{bHolder}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-serif font-bold text-sm text-luxury-black">
                      {formatPrice(transferAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-luxury-gold">{orderNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(orderNumber);
                          toast.success('Đã sao chép nội dung chuyển khoản!');
                        }}
                        className="text-luxury-gold hover:text-luxury-black transition-colors"
                        title="Sao chép mã đơn hàng"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-2xs text-slate-400">
                  ⚡ Hệ thống sẽ tự động đối soát và chuẩn bị hàng ngay khi ngân hàng nhận được tiền.
                </p>
              </div>
            );
          })()}

          {/* Purchased Items List Snapshot */}
          {orderData?.items && orderData.items.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Sản phẩm đã đặt ({orderData.items.length})
              </h4>
              <div className="space-y-3">
                {orderData.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-gray-100">
                        {item.productImage && (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{item.productName}</span>
                        <span className="text-2xs text-slate-400">Số lượng: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900">{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline justify-between text-xs">
                <span className="font-bold text-slate-800">Tổng thanh toán:</span>
                <span className="font-serif text-lg font-bold text-luxury-black">
                  {formatPrice(orderData.totalAmount)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/tra-cuu-don-hang?orderNumber=${orderNumber}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-luxury-black bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-luxury-black hover:bg-slate-50 transition-all shadow-sm"
          >
            <Package className="h-4 w-4" />
            <span>Theo dõi đơn hàng</span>
          </Link>

          <Link
            href="/san-pham"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-luxury-black px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-luxury-black-light transition-all shadow-luxury-lg"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Tiếp tục mua sắm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
