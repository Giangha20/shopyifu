'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Star,
  Bell,
  KeyRound,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/store/auth-guard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  {
    label: 'Thông tin cá nhân',
    href: '/tai-khoan',
    icon: User,
    exact: true,
  },
  {
    label: 'Sổ địa chỉ nhận hàng',
    href: '/tai-khoan/dia-chi',
    icon: MapPin,
  },
  {
    label: 'Đơn hàng đã mua (Đã mua)',
    href: '/tai-khoan/don-hang',
    icon: ShoppingBag,
  },
  {
    label: 'Sản phẩm yêu thích',
    href: '/tai-khoan/yeu-thich',
    icon: Heart,
  },
  {
    label: 'Đánh giá của tôi',
    href: '/tai-khoan/danh-gia',
    icon: Star,
  },
  {
    label: 'Hộp thư thông báo',
    href: '/tai-khoan/thong-bao',
    icon: Bell,
  },
  {
    label: 'Đổi mật khẩu',
    href: '/tai-khoan/doi-mat-khau',
    icon: KeyRound,
  },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/dang-nhap');
    router.refresh();
  };

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const activeItem = NAV_ITEMS.find((item) => isActive(item)) || NAV_ITEMS[0];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50/50 py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Top Title */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-6">
            <div>
              <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/" className="hover:text-luxury-black transition-colors">
                  Trang chủ
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-900 font-medium">Tài khoản thành viên</span>
              </nav>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-luxury-black">
                Không gian Khách hàng
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Thành viên Thượng lưu LUXE PRIVÉ</span>
            </div>
          </div>

          {/* Mobile Navigation Dropdown Bar */}
          <div className="lg:hidden mb-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <activeItem.icon className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    {activeItem.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Menu</span>
                  <Menu className="h-4 w-4" />
                </div>
              </button>

              {mobileMenuOpen && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="p-2 space-y-1">
                    {NAV_ITEMS.map((item) => {
                      const active = isActive(item);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            active
                              ? 'bg-slate-900 font-semibold text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${active ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Desktop Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* User Profile Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm text-center">
                  <div className="relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full ring-2 ring-amber-500/20 shadow-md bg-slate-900 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user ? `${user.firstName} ${user.lastName}` : 'Khách hàng'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-amber-400 font-serif text-lg font-bold select-none">
                        {user ? getInitials(user.firstName, user.lastName) : 'LX'}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-lg font-bold text-slate-900 line-clamp-1">
                    {user ? `${user.lastName} ${user.firstName}` : 'Khách hàng'}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {user?.email || ''}
                  </p>
                </div>

                {/* Sidebar Navigation Items */}
                <nav className="rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                          active
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4 w-4 transition-colors ${
                              active
                                ? 'text-amber-400'
                                : 'text-slate-400 group-hover:text-slate-700'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-transform ${
                            active
                              ? 'text-amber-400 translate-x-0.5'
                              : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                          }`}
                        />
                      </Link>
                    );
                  })}

                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="h-4 w-4 text-rose-500" />
                        <span>Đăng xuất</span>
                      </div>
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-3 min-w-0">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
