'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Trash2,
  Package,
  Tag,
  Info,
  ExternalLink,
  Loader2,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'order_status', label: 'Đơn hàng' },
  { id: 'promotion', label: 'Khuyến mãi' },
  { id: 'system', label: 'Hệ thống' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState('all');

  const fetchNotifications = React.useCallback(async (filter: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/user/notifications?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      console.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications(activeFilter);
  }, [activeFilter, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch {
      console.error('Failed to mark all as read');
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      console.error('Failed to mark notification as read');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notifications/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      console.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'promotion':
        return <Tag className="h-4 w-4 text-amber-600" />;
      case 'system':
      default:
        return <Info className="h-4 w-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-2xl font-bold text-luxury-black">
              Hộp thư thông báo
            </h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-2xs font-semibold text-white">
                {unreadCount} mới
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật trạng thái đơn hàng, ưu đãi VIP và các thông báo quan trọng từ hệ thống
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:bg-amber-50 text-xs gap-1.5 shrink-0"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Đánh dấu đã đọc tất cả</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
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

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
          <p className="text-xs text-slate-500">Đang tải hộp thư thông báo...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <Bell className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900">
            Không có thông báo nào
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Hiện quý khách không có thông báo mới nào trong danh mục này.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`relative rounded-xl border p-4 transition-all duration-200 flex items-start justify-between gap-4 ${
                  !item.isRead
                    ? 'border-amber-200/80 bg-amber-50/20 shadow-sm'
                    : 'border-slate-200/70 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shrink-0 mt-0.5 shadow-sm">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs ${
                          !item.isRead
                            ? 'font-bold text-slate-900'
                            : 'font-semibold text-slate-700'
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-2xs text-slate-400">
                      <span>{formatRelativeTime(item.createdAt)}</span>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => !item.isRead && handleMarkSingleRead(item.id)}
                          className="inline-flex items-center gap-1 font-medium text-amber-700 hover:underline"
                        >
                          <span>Xem chi tiết</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkSingleRead(item.id)}
                      title="Đánh dấu đã đọc"
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(item.id)}
                    title="Xóa thông báo"
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
