'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  User,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';

import {
  formatPrice,
  formatDateTime,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';

interface OrderItemDetail {
  id: string;
  productName: string;
  productSku: string;
  productImage: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface StatusHistoryItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  changedBy: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingMethod: string;
  shippingFee: number;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string | null;
  customerNote: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string | null;
  shippingProvince: string;
  shippingDistrict: string;
  shippingWard: string;
  shippingStreet: string;
  items: OrderItemDetail[];
  statusHistory: StatusHistoryItem[];
}

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Đặt hàng thành công' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'preparing', label: 'Đang chuẩn bị hàng' },
  { key: 'shipping', label: 'Đang giao hàng' },
  { key: 'delivered', label: 'Giao hàng thành công' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Action modals
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [isReturnModalOpen, setIsReturnModalOpen] = React.useState(false);
  const [returnReason, setReturnReason] = React.useState('');
  const [isSubmittingAction, setIsSubmittingAction] = React.useState(false);

  const fetchOrderDetail = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/user/orders/${orderId}`);
      if (!res.ok) {
        setError('Không tìm thấy thông tin đơn hàng hoặc quý khách không có quyền truy cập.');
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError('Lỗi khi tải thông tin đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, fetchOrderDetail]);

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setIsSubmittingAction(true);
      const res = await fetch(`/api/user/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason: cancelReason }),
      });

      if (res.ok) {
        setIsCancelModalOpen(false);
        await fetchOrderDetail();
      } else {
        const data = await res.json();
        alert(data.error || 'Hủy đơn hàng thất bại');
      }
    } catch {
      alert('Đã có lỗi xảy ra');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReturnRequest = async () => {
    if (!order) return;
    try {
      setIsSubmittingAction(true);
      const res = await fetch(`/api/user/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return_request', reason: returnReason }),
      });

      if (res.ok) {
        setIsReturnModalOpen(false);
        await fetchOrderDetail();
      } else {
        const data = await res.json();
        alert(data.error || 'Gửi yêu cầu đổi trả thất bại');
      }
    } catch {
      alert('Đã có lỗi xảy ra');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="text-xs text-slate-500">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-4">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
        <h3 className="font-serif text-lg font-bold text-slate-900">
          Không tìm thấy đơn hàng
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
        <div className="pt-2">
          <Link href="/tai-khoan/don-hang">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>Quay lại danh sách đơn hàng</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate timeline index
  const statusOrder = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered'];
  const currentStepIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const isReturnRequested = order.status.startsWith('return');

  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const canReturn = order.status === 'delivered';

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <Link
            href="/tai-khoan/don-hang"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Tất cả đơn hàng</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-luxury-black">
              Đơn hàng #{order.orderNumber}
            </h2>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                ORDER_STATUSES[order.status]?.color || 'bg-slate-100 text-slate-700'
              }`}
            >
              {ORDER_STATUSES[order.status]?.label || order.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Ngày đặt: {formatDateTime(order.createdAt)}</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="text-rose-600 border-rose-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400 text-xs"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              <span>Hủy đơn hàng</span>
            </Button>
          )}

          {canReturn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReturnModalOpen(true)}
              className="text-amber-700 border-amber-300 hover:bg-amber-50 hover:text-amber-800 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              <span>Yêu cầu đổi / trả hàng</span>
            </Button>
          )}
        </div>
      </div>

      {/* Progress Timeline (if not cancelled) */}
      {!isCancelled && !isReturnRequested && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6">
          <h3 className="font-serif text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Truck className="h-4 w-4 text-amber-600" />
            <span>Tiến độ giao hàng</span>
          </h3>

          <div className="relative flex flex-col md:flex-row justify-between gap-6">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className="relative flex md:flex-col items-center gap-3 md:gap-2 flex-1 text-left md:text-center"
                >
                  {/* Step Icon */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors shrink-0 z-10 ${
                      isCompleted
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>

                  <div className="space-y-0.5">
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-amber-700 font-bold'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="inline-block text-2xs text-amber-600">
                        Đang thực hiện
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {order.trackingNumber && (
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Mã vận đơn bưu cục:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                {order.trackingNumber}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 text-xs text-rose-800 space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <XCircle className="h-4 w-4 text-rose-600" />
            <span>Đơn hàng này đã bị hủy</span>
          </div>
          <p className="text-slate-600 pl-6">
            Lý do hủy: {order.cancelReason || 'Khách hàng hủy đơn'}
            {order.cancelledAt && ` (${formatDateTime(order.cancelledAt)})`}
          </p>
        </div>
      )}

      {/* Return Requested Banner */}
      {isReturnRequested && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <RotateCcw className="h-4 w-4 text-amber-700" />
            <span>Yêu cầu đổi / trả đang được xem xét</span>
          </div>
          <p className="text-slate-600 pl-6">
            Chuyên viên chăm sóc khách hàng của LUXE SHOP sẽ liên hệ hỗ trợ quý khách qua điện thoại trong vòng 24 giờ.
          </p>
        </div>
      )}

      {/* Order Items Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-600" />
            <span>Danh sách sản phẩm ({order.items.length})</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100 p-6">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-20 w-20 relative rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">
                    {item.productName}
                  </h4>
                  <p className="text-2xs text-slate-500 font-mono">
                    SKU: {item.productSku}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-slate-500">
                      Phân loại: <span className="font-medium text-slate-700">{item.variantName}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50 text-xs">
                <div className="text-slate-500">
                  <span>Số lượng: </span>
                  <span className="font-semibold text-slate-900">x{item.quantity}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900 text-sm">
                    {formatPrice(item.totalPrice)}
                  </div>
                  <div className="text-2xs text-slate-400">
                    {formatPrice(item.unitPrice)} / sản phẩm
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Split Grid: Shipping, Payment, Breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Shipping & Delivery Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-600" />
            <span>Địa chỉ nhận hàng</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{order.shippingName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{order.shippingPhone}</span>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {order.shippingStreet}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
              </span>
            </div>
            {order.customerNote && (
              <div className="pt-2 text-slate-500 italic border-t border-slate-100">
                Ghi chú: &ldquo;{order.customerNote}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Payment & Summary Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-amber-600" />
            <span>Chi tiết thanh toán</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Hình thức:</span>
              <span className="font-medium text-slate-900">
                {PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Trạng thái thanh toán:</span>
              <span className="font-semibold text-emerald-700">
                {PAYMENT_STATUSES[order.paymentStatus]?.label || order.paymentStatus}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span>Tạm tính tiền hàng:</span>
                <span className="text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Phí vận chuyển:</span>
                <span className="text-slate-900">
                  {order.shippingFee > 0 ? formatPrice(order.shippingFee) : 'Miễn phí'}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex items-center justify-between text-amber-700">
                  <span>Khuyến mãi / Giảm giá:</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-bold text-sm text-slate-900">
                <span className="font-serif text-base">Tổng cộng thanh toán:</span>
                <span className="font-serif text-lg text-amber-700">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <ModalContent size="default" className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="text-rose-600">Hủy đơn hàng</ModalTitle>
            <ModalDescription>
              Vui lòng cho LUXE SHOP biết lý do bạn muốn hủy đơn hàng này để chúng tôi nâng cao chất lượng dịch vụ.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-3 py-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Lý do hủy đơn
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: Thay đổi địa chỉ nhận hàng, muốn đổi màu sắc khác..."
              className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Giữ lại đơn hàng
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="md"
              isLoading={isSubmittingAction}
              loadingText="Đang xử lý..."
              onClick={handleCancelOrder}
            >
              Xác nhận hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Return Request Modal */}
      <Modal open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <ModalContent size="default" className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="text-amber-700">Yêu cầu đổi / trả hàng</ModalTitle>
            <ModalDescription>
              Chính sách đổi trả trong vòng 7 ngày kể từ khi nhận hàng đối với sản phẩm còn nguyên tem mác.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-3 py-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Mô tả chi tiết yêu cầu
            </label>
            <textarea
              rows={4}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Vui lòng nêu rõ lý do đổi size, đổi mẫu hoặc tình trạng sản phẩm..."
              className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsReturnModalOpen(false)}
            >
              Đóng
            </Button>
            <Button
              type="button"
              variant="gold"
              size="md"
              isLoading={isSubmittingAction}
              loadingText="Đang gửi..."
              onClick={handleReturnRequest}
            >
              Gửi yêu cầu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
