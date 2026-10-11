'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Settings,
  Shield,
  Loader2,
  ShoppingBag,
  ExternalLink,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface OrderNotification {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface AdminHeaderProps {
  onMenuToggle: () => void;
  currentUser?: {
    name?: string;
    email?: string;
    role?: string;
  };
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onMenuToggle,
  currentUser,
  title,
}) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [recentOrders, setRecentOrders] = useState<OrderNotification[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const previousOrderCountRef = useRef<number>(0);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders?limit=6');
      if (res.ok) {
        const data = await res.json();
        const orders: OrderNotification[] = data.orders || data.data || [];
        setRecentOrders(orders);

        const pending = orders.filter(
          (o) => o.status === 'pending' || o.status === 'processing'
        ).length;
        setPendingCount(pending > 0 ? pending : orders.length > 0 ? orders.length : 0);

        // Check if new orders arrived to alert
        if (
          previousOrderCountRef.current > 0 &&
          orders.length > previousOrderCountRef.current
        ) {
          // New order arrived!
          console.log('New order received!');
        }
        previousOrderCountRef.current = orders.length;
      }
    } catch (err) {
      console.warn('Error fetching admin orders notifications:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-2xs font-semibold text-amber-800">
            Chờ xử lý
          </span>
        );
      case 'processing':
        return (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-2xs font-semibold text-blue-800">
            Đang xử lý
          </span>
        );
      case 'shipped':
        return (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-2xs font-semibold text-indigo-800">
            Đang giao
          </span>
        );
      case 'delivered':
        return (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-2xs font-semibold text-emerald-800">
            Đã giao
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left Title and Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Mở Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="font-serif text-lg font-bold text-slate-900 sm:text-xl">
            {title}
          </h1>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Thông báo đơn hàng mới"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in-down overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-luxury-gold" />
                    <span className="text-xs font-bold text-slate-900">
                      Thông Báo Đơn Hàng Mới
                    </span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-2xs font-bold text-rose-700">
                      {pendingCount} đơn cần xử lý
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {recentOrders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Chưa có đơn hàng nào trong hệ thống
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/don-hang/${order.id}`}
                        onClick={() => setNotifOpen(false)}
                        className="flex flex-col gap-1 p-3.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-luxury-black">
                            #{order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center justify-between text-2xs text-slate-600">
                          <span className="truncate max-w-[150px] font-medium">
                            {order.customerName || 'Khách hàng ẩn danh'}
                          </span>
                          <span className="font-semibold text-rose-600">
                            {formatVND(order.totalAmount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString('vi-VN')
                              : 'Vừa xong'}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50 p-2 text-center">
                  <Link
                    href="/admin/don-hang"
                    onClick={() => setNotifOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-luxury-gold hover:text-slate-900 transition-colors"
                  >
                    <span>Xem tất cả danh sách đơn hàng</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-1.5 pl-2 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-luxury-gold text-white font-semibold text-xs shadow-sm">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-700">
              {currentUser?.name || 'Quản trị viên'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in-down">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">
                    {currentUser?.name || 'Quản trị viên'}
                  </p>
                  <p className="text-2xs text-slate-500 truncate">
                    {currentUser?.email || 'admin@luxeshop.vn'}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/admin/cai-dat"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Cài đặt hệ thống</span>
                  </Link>
                  <Link
                    href="/admin/nhan-vien"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-slate-400" />
                    <span>Phân quyền tài khoản</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
