'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/use-wishlist';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function MobileBottomNav({ onSearchClick }: { onSearchClick?: () => void }) {
  const pathname = usePathname();
  const wishlistCount = useWishlist((state) => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      label: 'Trang chủ',
      href: '/',
      icon: Home,
    },
    {
      label: 'Sản phẩm',
      href: '/san-pham',
      icon: Grid,
    },
    {
      label: 'Tìm kiếm',
      href: '/tim-kiem',
      icon: Search,
    },
    {
      label: 'Yêu thích',
      href: '/yeu-thich',
      icon: Heart,
      badge: mounted ? wishlistCount : 0,
    },
    {
      label: 'Tài khoản',
      href: '/tai-khoan',
      icon: User,
    },

  ];

  return (
    <nav
      aria-label="Thanh điều hướng di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          if (item.label === 'Tìm kiếm' && onSearchClick) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={onSearchClick}
                className={cn(
                  'relative flex flex-col items-center justify-center h-full py-1 text-slate-500 transition-colors',
                  isActive && 'text-luxury-black font-semibold'
                )}
              >
                <div className="relative p-1">
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[10px] leading-tight mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center h-full py-1 text-slate-500 hover:text-luxury-black transition-colors',
                isActive && 'text-luxury-black font-semibold'
              )}
            >
              <div className="relative p-1">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isActive && 'text-luxury-gold scale-110'
                  )}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-0.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-luxury-gold text-[10px] font-bold text-white shadow-sm">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] leading-tight mt-0.5 tracking-tight transition-colors',
                  isActive ? 'text-luxury-black font-semibold' : 'text-slate-500'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-luxury-gold" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
