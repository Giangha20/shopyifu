'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Clock,
  User,
  MapPin,
  CreditCard,
  Truck,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  QrCode,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatPrice,
  formatDateTime,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from '@/lib/utils';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setOrder(data.order);
      setStatus(data.order.status);
      setPaymentStatus(data.order.paymentStatus);
      setTrackingNumber(data.order.trackingNumber || '');
      setInternalNote(data.order.internalNote || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paymentStatus,
          trackingNumber,
          internalNote,
          note,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');
      alert('Cập nhật trạng thái đơn hàng thành công');
      setNote('');
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
        <p className="text-sm text-slate-500">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-rose-600">Không tìm thấy đơn hàng!</p>
      </div>
    );
  }

  const currentStatusMeta = ORDER_STATUSES[order.status] || {
    label: order.status,
    color: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/don-hang"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                Đơn hàng #{order.orderNumber}
              </h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${currentStatusMeta.color}`}>
                {currentStatusMeta.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Đặt lúc: {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="self-start sm:self-auto gap-2"
        >
          <Printer className="h-4 w-4" />
          In hóa đơn
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Order Items & Order Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items Table Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Chi tiết sản phẩm ({order.items?.length || 0})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-3 font-semibold uppercase">Sản phẩm</th>
                    <th className="pb-3 font-semibold uppercase">Đơn giá</th>
                    <th className="pb-3 font-semibold uppercase text-center">SL</th>
                    <th className="pb-3 font-semibold uppercase text-right">Tổng cộng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {order.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                            <img
                              src={item.productImage || '/placeholder.jpg'}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                              onError={(e: any) => {
                                e.target.src = '/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.productName}</p>
                            <p className="text-2xs font-mono text-slate-400">SKU: {item.productSku}</p>
                            {item.variantName && (
                              <p className="text-2xs text-luxury-gold font-medium">
                                Phân loại: {item.variantName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{formatPrice(item.unitPrice)}</td>
                      <td className="py-3 text-center font-semibold">{item.quantity}</td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        {formatPrice(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price breakdown */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính hàng hóa:</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá (Mã: {order.couponCode || 'Voucher'}):</span>
                  <span className="font-semibold">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold">{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-100 pt-2">
                <span>Tổng giá trị đơn hàng:</span>
                <span className="text-luxury-gold text-lg">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Timeline & Status History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Lịch sử trạng thái đơn hàng
            </h2>

            {order.statusHistory?.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có cập nhật trạng thái</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {order.statusHistory?.map((hist: any) => (
                  <div key={hist.id} className="relative">
                    <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-luxury-gold shadow-sm" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Chuyển sang: {ORDER_STATUSES[hist.toStatus]?.label || hist.toStatus}
                      </p>
                      <p className="text-2xs text-slate-400">
                        {formatDateTime(hist.createdAt)} • Bởi: {hist.changedBy || 'Hệ thống'}
                      </p>
                      {hist.note && (
                        <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                          Ghi chú: {hist.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Customer info, Shipping info & Controls */}
        <div className="space-y-6">
          {/* Quick status update card */}
          <form
            onSubmit={handleUpdate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Cập nhật đơn hàng
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Trạng thái xử lý</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              >
                {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Thanh toán</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              >
                {Object.entries(PAYMENT_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Mã vận đơn (Tracking)</label>
              <input
                type="text"
                placeholder="VD: VNPOST123456"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Ghi chú lịch sử</label>
              <textarea
                rows={2}
                placeholder="Lý do đổi trạng thái..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Ghi chú nội bộ</label>
              <textarea
                rows={2}
                placeholder="Ghi chú riêng cho nhân viên..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-luxury-black text-white hover:bg-luxury-black-light"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Lưu thay đổi
            </Button>
          </form>

          {/* Customer info card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              Khách hàng
            </h2>

            <div className="space-y-1">
              <p className="font-bold text-slate-900">{order.shippingName}</p>
              <p className="text-slate-500">SĐT: {order.shippingPhone}</p>
              <p className="text-slate-500">Email: {order.shippingEmail || '—'}</p>
              {order.userId && (
                <Link
                  href={`/admin/khach-hang/${order.userId}`}
                  className="inline-block mt-2 font-semibold text-luxury-gold hover:underline"
                >
                  Xem hồ sơ khách hàng →
                </Link>
              )}
            </div>
          </div>

          {/* Shipping delivery address card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              Địa chỉ giao hàng
            </h2>

            <div className="space-y-1 leading-relaxed text-slate-700">
              <p>{order.shippingStreet}</p>
              <p>
                {order.shippingWard}, {order.shippingDistrict}
              </p>
              <p className="font-semibold text-slate-900">{order.shippingProvince}</p>
            </div>

            {order.customerNote && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-900">
                <p className="font-semibold">Lời nhắn của khách:</p>
                <p className="mt-0.5">{order.customerNote}</p>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                Phương thức thanh toán
              </span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {PAYMENT_STATUSES[order.paymentStatus]?.label || order.paymentStatus}
              </span>
            </h2>

            <div>
              <p className="font-semibold text-slate-900">
                {PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod}
              </p>
              <p className="text-slate-500 mt-1">
                Tổng thanh toán:{' '}
                <span className="font-serif font-bold text-sm text-luxury-black">
                  {formatPrice(order.totalAmount)}
                </span>
              </p>
            </div>

            {/* MÃ QR THANH TOÁN CHO ĐƠN HÀNG NÀY (DÀNH CHO ADMIN) */}
            {(() => {
              const qrUrl = `https://img.vietqr.io/image/MB-888866669999-compact2.png?amount=${Number(order.totalAmount || 0)}&addInfo=${encodeURIComponent(order.orderNumber)}&accountName=LUXE%20SHOP%20VIET%20NAM`;

              return (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-2xs flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-luxury-gold" />
                      Mã QR Thanh Toán (VietQR)
                    </span>
                    <a
                      href={qrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-2xs text-luxury-gold hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Mở ảnh to
                    </a>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="p-1 bg-white rounded-lg shadow-sm shrink-0 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrUrl}
                        alt={`QR đơn ${order.orderNumber}`}
                        className="w-20 h-20 object-contain rounded"
                      />
                    </div>
                    <div className="space-y-1 text-2xs flex-1">
                      <p className="font-semibold text-slate-800">MBBank: 8888 6666 9999</p>
                      <p className="text-slate-600">Nội dung: <strong className="font-mono text-luxury-gold">{order.orderNumber}</strong></p>
                      <p className="text-slate-500">Số tiền: <strong>{formatPrice(order.totalAmount)}</strong></p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(qrUrl);
                          alert('Đã sao chép đường dẫn mã QR! Bạn có thể dán gửi cho khách hàng.');
                        }}
                        className="inline-flex items-center gap-1 text-luxury-gold hover:text-luxury-black font-semibold mt-1"
                      >
                        <Copy className="h-3 w-3" />
                        Sao chép link QR gửi khách
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
