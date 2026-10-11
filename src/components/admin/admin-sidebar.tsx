'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  Tag,
  FileText,
  Star,
  LifeBuoy,
  Image as ImageIcon,
  Settings,
  ShieldCheck,
  History,
  TrendingUp,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

const NAV_ITEMS = [
  {
    title: 'Tổng quan',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/bao-cao', label: 'Báo cáo', icon: TrendingUp },
    ],
  },
  {
    title: 'Quản lý bán hàng',
    items: [
      { href: '/admin/don-hang', label: 'Đơn hàng', icon: ShoppingBag },
      { href: '/admin/san-pham', label: 'Sản phẩm', icon: Package },
      { href: '/admin/danh-muc', label: 'Danh mục', icon: Layers },
      { href: '/admin/kho-hang', label: 'Kho hàng', icon: Warehouse },
      { href: '/admin/khach-hang', label: 'Khách hàng', icon: Users },
      { href: '/admin/khuyen-mai', label: 'Khuyến mãi', icon: Tag },
    ],
  },
  {
    title: 'Nội dung & CSKH',
    items: [
      { href: '/admin/bai-viet', label: 'Bài viết', icon: FileText },
      { href: '/admin/danh-gia', label: 'Đánh giá', icon: Star },
      { href: '/admin/ho-tro', label: 'Hỗ trợ ticket', icon: LifeBuoy },
      { href: '/admin/banner', label: 'Banner quảng cáo', icon: ImageIcon },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { href: '/admin/nhan-vien', label: 'Nhân viên & Phân quyền', icon: ShieldCheck },
      { href: '/admin/nhat-ky', label: 'Nhật ký kiểm toán', icon: History },
      { href: '/admin/cai-dat', label: 'Cài đặt hệ thống', icon: Settings },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-luxury-black text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-luxury-black-light shadow-2xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-luxury-gold text-luxury-black font-bold text-lg shadow-glow">
              L
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-wider text-white">
                LUXE SHOP
              </span>
              <span className="block text-2xs uppercase tracking-widest text-luxury-gold font-semibold">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Đóng sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-white/10">
          <div className="space-y-6">
            {NAV_ITEMS.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <p className="px-3 text-2xs font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isLinkActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-luxury-gold text-luxury-black font-semibold shadow-glow'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            active ? 'text-luxury-black' : 'text-slate-400 group-hover:text-luxury-gold'
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Area */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-luxury-gold/20 text-luxury-gold font-semibold text-sm border border-luxury-gold/40">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="truncate text-xs font-semibold text-white">
                  {currentUser?.name || 'Quản trị viên'}
                </p>
                <p className="truncate text-2xs text-slate-400">
                  {currentUser?.email || 'admin@luxeshop.vn'}
                </p>
              </div>
            </div>
            <Link
              href="/"
              target="_blank"
              title="Xem cửa hàng"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-luxury-gold transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
