'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  ChevronRight,
  Package,
  Calendar,
  CreditCard,
  ChevronLeft,
  Filter,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { formatPrice, formatDate, ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderItemSummary {
  id: string;
  productName: string;
  productSku: string;
  productImage: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  totalItemsCount: number;
  createdAt: string;
  items: OrderItemSummary[];
}

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'delivered', label: 'Đã giao' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeStatus, setActiveStatus] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchOrders = React.useCallback(async (status: string, page: number) => {
    try {
      setIsLoading(true);
      const statusParam = status !== 'all' ? `status=${status}&` : '';
      const url = `/api/orders?${statusParam}page=${page}&limit=10`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      console.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders(activeStatus, currentPage);
  }, [activeStatus, currentPage, fetchOrders]);

  const handleTabChange = (status: string) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const config = ORDER_STATUSES[status] || {
      label: status,
      color: 'text-slate-600 bg-slate-100',
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-2xs font-semibold ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-serif text-2xl font-bold text-luxury-black">
          Đơn hàng đã mua (Sản phẩm đã mua)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi tiến độ vận chuyển, tra cứu mã vận đơn và chi tiết các sản phẩm bạn đã mua
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
          <p className="text-xs text-slate-500">Đang tải lịch sử mua sắm...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900">
            Không tìm thấy đơn hàng nào
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {activeStatus === 'all'
              ? 'Quý khách chưa có đơn hàng nào tại LUXE SHOP. Hãy khám phá bộ sưu tập mới nhất ngay hôm nay!'
              : `Không có đơn hàng nào trong trạng thái này.`}
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button variant="gold" size="md">
                Khám phá bộ sưu tập
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 px-5 py-3.5 border-b border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-slate-900">
                    Mã đơn: <span className="text-amber-700">#{order.orderNumber}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items Preview */}
              <div className="p-5 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-16 w-16 relative rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {item.productName}
                        </h4>
                        {item.variantName && (
                          <p className="text-2xs text-slate-500">
                            Phân loại: {item.variantName}
                          </p>
                        )}
                        <p className="text-2xs text-slate-400">
                          Số lượng: x{item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-slate-900">
                        {formatPrice(item.totalPrice)}
                      </div>
                      <div className="text-2xs text-slate-400">
                        {formatPrice(item.unitPrice)} / sp
                      </div>
                    </div>
                  </div>
                ))}

                {order.totalItemsCount > order.items.length && (
                  <div className="pt-2 text-center">
                    <span className="text-2xs text-slate-400">
                      và {order.totalItemsCount - order.items.length} sản phẩm khác trong đơn...
                    </span>
                  </div>
                )}
              </div>

              {/* Order Card Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40 px-5 py-4 border-t border-slate-100">
                <div className="text-xs text-slate-600">
                  <span>Tổng tiền thanh toán: </span>
                  <span className="font-serif text-base font-bold text-amber-700 ml-1">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/tai-khoan/don-hang/${order.orderNumber}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-xs gap-1.5"
                    >
                      <span>Xem chi tiết</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-600 px-3">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
