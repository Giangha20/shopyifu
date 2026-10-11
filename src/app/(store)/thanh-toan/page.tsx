'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Building2,
  Banknote,
  QrCode,
  Tag,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useStoreSettings } from '@/hooks/use-settings';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { toast } from '@/components/ui/toast';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ và tên của bạn'),
  phone: z
    .string()
    .min(9, 'Số điện thoại không hợp lệ')
    .regex(/^(0[1-9])\d{8,9}$/, 'Số điện thoại không đúng định dạng (VD: 0912345678)'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  province: z.string().min(2, 'Vui lòng chọn Tỉnh / Thành phố'),
  district: z.string().min(2, 'Vui lòng chọn Quận / Huyện'),
  ward: z.string().min(2, 'Vui lòng chọn Phường / Xã'),
  street: z.string().min(5, 'Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)'),
  note: z.string().optional(),
  shippingMethod: z.enum(['standard', 'express', 'vip']),
  paymentMethod: z.enum(['cod', 'bank_transfer', 'vnpay', 'paypal', 'stripe_card']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    desc: 'Nhận hàng sau 2-3 ngày làm việc trong hộp LUXE signature',
    price: 0,
  },
  {
    id: 'express',
    name: 'Giao hàng hỏa tốc (Express)',
    desc: 'Nhận hàng trong 24 giờ đối với thành phố lớn',
    price: 50000,
  },
  {
    id: 'vip',
    name: 'LUXE VIP Concierge (Trong ngày)',
    desc: 'Chuyên viên giao tận tay kèm găng tay trắng & thử đồ tại chỗ',
    price: 150000,
  },
];

const PAYMENT_OPTIONS = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Kiểm tra hàng trước khi thanh toán tiền mặt cho nhân viên giao hàng.',
    icon: Banknote,
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản Ngân hàng (VietQR 24/7)',
    desc: 'Quét mã QR tự động xác nhận trong 1 phút qua MBBank, Techcombank, VCB.',
    icon: QrCode,
  },
  {
    id: 'paypal',
    name: 'Thanh toán Quốc tế PayPal (USD / EUR / Toàn cầu)',
    desc: 'Thanh toán tức thì toàn cầu bằng tài khoản PayPal an toàn & được bảo hiểm.',
    icon: CreditCard,
  },
  {
    id: 'stripe_card',
    name: 'Thẻ Quốc Tế Visa / Mastercard / JCB / Apple Pay',
    desc: 'Thanh toán trực tiếp thẻ tín dụng quốc tế bảo mật theo chuẩn PCI-DSS.',
    icon: CreditCard,
  },
  {
    id: 'vnpay',
    name: 'Cổng thanh toán VNPay / Thẻ nội địa',
    desc: 'Hỗ trợ thẻ ATM và quét VNPay-QR hơn 40 ngân hàng Việt Nam.',
    icon: CreditCard,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    coupon,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    clearCart,
  } = useCartStore();

  const { settings, fetchSettings, isLoaded: isSettingsLoaded } = useStoreSettings();

  React.useEffect(() => {
    if (!isSettingsLoaded) {
      fetchSettings();
    }
  }, [isSettingsLoaded, fetchSettings]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      province: 'Hà Nội',
      district: 'Hoàn Kiếm',
      ward: 'Tràng Tiền',
      street: '',
      note: '',
      shippingMethod: 'standard',
      paymentMethod: 'cod',
    },
  });

  const selectedShipping = watch('shippingMethod');
  const selectedPayment = watch('paymentMethod');

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shippingFeeOption =
    SHIPPING_OPTIONS.find((s) => s.id === selectedShipping)?.price || 0;
  const baseShipping = subtotal >= 2000000 ? 0 : 40000;
  const totalShipping = shippingFeeOption + baseShipping;
  const finalTotal = Math.max(0, subtotal - discount + totalShipping);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error('Giỏ hàng trống. Vui lòng chọn sản phẩm trước khi thanh toán.');
      router.push('/san-pham');
      return;
    }

    setIsSubmitting(true);
    const orderNumber = generateOrderNumber();

    try {
      // Create order via API or fallback payload
      const orderPayload = {
        orderNumber,
        shippingName: data.fullName,
        shippingPhone: data.phone,
        shippingEmail: data.email,
        shippingProvince: data.province,
        shippingDistrict: data.district,
        shippingWard: data.ward,
        shippingStreet: data.street,
        shippingMethod: data.shippingMethod,
        shippingFee: totalShipping,
        paymentMethod: data.paymentMethod,
        customerNote: data.note,
        subtotal,
        discountAmount: discount,
        totalAmount: finalTotal,
        couponCode: coupon?.code || null,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.name,
          productSku: item.sku,
          productImage: item.image,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
      };

      let finalOrderNumber = orderNumber;
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingName: data.fullName,
            shippingPhone: data.phone,
            shippingEmail: data.email,
            shippingProvince: data.province,
            shippingDistrict: data.district,
            shippingWard: data.ward,
            shippingStreet: data.street,
            shippingMethod: data.shippingMethod,
            paymentMethod: data.paymentMethod,
            customerNote: data.note,
            couponCode: coupon?.code || undefined,
            items: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || undefined,
              quantity: item.quantity,
            })),
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.data?.orderNumber) {
            finalOrderNumber = resData.data.orderNumber;
          }
        }
      } catch (err) {
        console.warn('Order sync to backend fallback:', err);
      }

      // Store order details in session storage for the confirmation page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`order_${finalOrderNumber}`, JSON.stringify({
          ...orderPayload,
          orderNumber: finalOrderNumber,
        }));
      }

      clearCart();
      toast.success('Đặt hàng thành công!');
      router.push(`/thanh-toan/thanh-cong?orderNumber=${finalOrderNumber}`);
    } catch {
      toast.error('Đã có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.');

      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="container-luxe pt-4">
        <Breadcrumbs
          items={[
            { label: 'Giỏ hàng', href: '/gio-hang' },
            { label: 'Thanh toán' },
          ]}
        />

        <div className="mt-2 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-black tracking-tight">
            Thanh Toán Đơn Hàng
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Hoàn tất các bước dưới đây để sở hữu những tác phẩm thời trang thượng hạng.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: Checkout Information Forms */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Shipping Information */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-luxury-black text-2xs font-bold text-white">
                    1
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Thông Tin Giao Hàng
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Họ và tên người nhận <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      {...register('fullName')}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm transition-all focus:outline-none ${
                        errors.fullName ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-2xs text-rose-500">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0912345678"
                      {...register('phone')}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm transition-all focus:outline-none ${
                        errors.phone ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-2xs text-rose-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Email nhận hóa đơn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="khachhang@luxury.vn"
                      {...register('email')}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm transition-all focus:outline-none ${
                        errors.email ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-2xs text-rose-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Tỉnh / Thành phố <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register('province')}
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                    >
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Quảng Ninh">Quảng Ninh</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Quận / Huyện <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Quận Hoàn Kiếm / Quận 1"
                      {...register('district')}
                      className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Phường / Xã <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Phường Tràng Tiền / Bến Nghé"
                      {...register('ward')}
                      className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Địa chỉ chi tiết (Số nhà, tên đường, căn hộ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Số 15 Tràng Tiền, Hoàn Kiếm"
                      {...register('street')}
                      className={`h-11 w-full rounded-xl border px-3.5 text-sm transition-all focus:outline-none ${
                        errors.street ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200 focus:border-luxury-gold'
                      }`}
                    />
                    {errors.street && (
                      <p className="text-2xs text-rose-500">{errors.street.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Ghi chú đơn hàng (Tùy chọn)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Yêu cầu bọc hộp quà tặng đặc biệt, giờ giao hàng cụ thể..."
                      {...register('note')}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-luxury-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Methods */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-luxury-black text-2xs font-bold text-white">
                    2
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Phương Thức Vận Chuyển
                  </h3>
                </div>

                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map((opt) => {
                    const isSelected = selectedShipping === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? 'border-luxury-gold bg-brand-50/30 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            value={opt.id}
                            {...register('shippingMethod')}
                            className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold"
                          />
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                              {opt.name}
                            </span>
                            <span className="text-2xs sm:text-xs text-slate-500">
                              {opt.desc}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {opt.price === 0 ? 'Miễn phí' : formatPrice(opt.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Payment Methods */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-luxury-black text-2xs font-bold text-white">
                    3
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Phương Thức Thanh Toán
                  </h3>
                </div>

                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const isSelected = selectedPayment === opt.id;
                    const Icon = opt.icon;
                    return (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? 'border-luxury-gold bg-brand-50/30 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={opt.id}
                          {...register('paymentMethod')}
                          className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-luxury-gold" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {opt.name}
                            </span>
                          </div>
                          <p className="mt-1 text-2xs sm:text-xs text-slate-500">
                            {opt.desc}
                          </p>

                          {/* Bank QR details preview if Bank Transfer chosen */}
                          {isSelected && opt.id === 'bank_transfer' && (() => {
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
                            const qrUrl = settings.paymentQrCode || `https://img.vietqr.io/image/${bCode}-${cleanAcc}-compact2.png?amount=${finalTotal}&addInfo=LUXE%20SHOP&accountName=${encodeURIComponent(bHolder)}`;

                            return (
                              <div className="mt-3 rounded-2xl border border-dashed border-luxury-gold/50 bg-brand-50/20 p-4 text-xs text-slate-700 space-y-3">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                  {/* QR Code thumbnail */}
                                  <div className="relative shrink-0 p-2 bg-white rounded-xl shadow-sm border border-luxury-gold/30">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={qrUrl}
                                      alt="Mã QR Chuyển Khoản"
                                      className="h-28 w-28 object-contain rounded-lg"
                                    />
                                    <span className="block text-[10px] text-center font-bold text-luxury-gold uppercase mt-1">
                                      Quét VietQR
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-xs">
                                    <p className="font-bold text-luxury-gold uppercase tracking-wider text-2xs">
                                      Tài Khoản Thụ Hưởng LUXE SHOP:
                                    </p>
                                    <p className="text-slate-800">
                                      Ngân hàng: <strong>{bName}</strong>
                                    </p>
                                    <p className="text-slate-800">
                                      Số tài khoản: <strong className="font-mono text-sm text-luxury-black">{bAcc}</strong>
                                    </p>
                                    <p className="text-slate-800">
                                      Chủ tài khoản: <strong className="uppercase">{bHolder}</strong>
                                    </p>
                                    <p className="text-slate-800">
                                      Số tiền: <strong className="text-luxury-gold">{formatPrice(finalTotal)}</strong>
                                    </p>
                                  </div>
                                </div>
                                <p className="text-2xs text-slate-500 italic pt-1 border-t border-luxury-gold/20">
                                  💡 Bạn có thể quét mã QR ngay bây giờ hoặc tại trang xác nhận sau khi bấm &ldquo;Đặt hàng ngay&rdquo;.
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Order Summary & Place Order */}
            <div className="lg:col-span-5 rounded-3xl border border-gray-100 bg-white p-6 sm:p-7 shadow-sm sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Đơn Hàng ({items.length} món)
                </h3>
                <Link
                  href="/gio-hang"
                  className="text-xs font-semibold text-luxury-gold hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Sửa giỏ hàng
                </Link>
              </div>

              {/* Items List preview */}
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1 no-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-luxury-black text-2xs font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-2xs text-slate-500">
                        {item.variantName || 'Chuẩn'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Mã giảm giá ({coupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-slate-800">
                    {totalShipping === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-2xs">Miễn phí</span>
                    ) : (
                      formatPrice(totalShipping)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between">
                  <span className="font-serif text-base font-bold text-slate-900">Tổng thanh toán</span>
                  <span className="font-serif text-2xl font-bold text-luxury-black">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-luxury-black py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-luxury-lg hover:bg-luxury-black-light transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang khởi tạo đơn hàng...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Đặt hàng ngay ({formatPrice(finalTotal)})</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-2xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Bảo mật thanh toán chuẩn 256-bit SSL</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
