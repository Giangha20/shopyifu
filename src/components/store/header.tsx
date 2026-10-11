'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  User,
  LogOut,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { useStoreSettings } from '@/hooks/use-settings';

interface MegaCategory {
  title: string;
  href: string;
  items: { name: string; href: string }[];
}

const MEGA_CATEGORIES: MegaCategory[] = [
  {
    title: 'Thời Trang Nữ',
    href: '/danh-muc/dam-vay-thiet-ke',
    items: [
      { name: 'Đầm dạ hội & Sự kiện', href: '/san-pham?category=dam-da-hoi' },
      { name: 'Áo sơ mi & Áo kiểu lụa', href: '/san-pham?category=ao-so-mi-nu' },
      { name: 'Áo blazer & Áo khoác dạ', href: '/san-pham?category=ao-khoac-nu' },
      { name: 'Chân váy & Quần âu thanh lịch', href: '/san-pham?category=quan-vay-nu' },
      { name: 'Set đồ thiết kế cao cấp', href: '/san-pham?category=set-do-nu' },
    ],
  },
  {
    title: 'Thời Trang Nam',
    href: '/danh-muc/ao-khoac-blazer',
    items: [
      { name: 'Suit & Tuxedo may đo', href: '/san-pham?category=suit-nam' },
      { name: 'Áo sơ mi Oxford & Bamboo', href: '/san-pham?category=so-mi-nam' },
      { name: 'Áo polo dệt kim Ý', href: '/san-pham?category=polo-nam' },
      { name: 'Quần tây may đo & Chinos', href: '/san-pham?category=quan-tay-nam' },
      { name: 'Áo khoác da & Măng tô', href: '/san-pham?category=ao-khoac-nam' },
    ],
  },
  {
    title: 'Phụ Kiện Xa Xỉ',
    href: '/danh-muc/tui-xach-da',
    items: [
      { name: 'Túi da bò thủ công', href: '/san-pham?category=tui-xach' },
      { name: 'Ví da cá sấu & Cầm tay', href: '/san-pham?category=vi-da' },
      { name: 'Thắt lưng da cao cấp', href: '/san-pham?category=that-lung' },
      { name: 'Khăn lụa tơ tằm Vạn Phúc', href: '/san-pham?category=khan-lua' },
      { name: 'Kính mắt gọng titanium', href: '/san-pham?category=kinh-mat' },
    ],
  },
  {
    title: 'Trang Sức & Đồng Hồ',
    href: '/danh-muc/phu-kien-trang-suc',
    items: [
      { name: 'Đồng hồ cơ Thụy Sĩ chế tác', href: '/san-pham?category=dong-ho' },
      { name: 'Dây chuyền vàng & Kim cương', href: '/san-pham?category=day-chuyen' },
      { name: 'Nhẫn đính hôn & Vĩnh cửu', href: '/san-pham?category=nhan' },
      { name: 'Vòng tay ngọc trai Akoya', href: '/san-pham?category=ngoc-trai' },
      { name: 'Khuyên tai đá quý tinh xảo', href: '/san-pham?category=khuyen-tai' },
    ],
  },
];


const POPULAR_SEARCHES = [
  'Đầm lụa tơ tằm',
  'Suit may đo',
  'Túi xách da thủ công',
  'Đồng hồ cơ',
  'Khăn lụa cao cấp',
  'Bộ sưu tập Mùa Thu',
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, getItemCount } = useCart();
  const wishlistCount = useWishlist((state) => state.getItemCount());
  const { user, logout, fetchUser, isInitialized } = useAuth();
  const { settings, fetchSettings, isLoaded: isSettingsLoaded } = useStoreSettings();

  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize store settings
  useEffect(() => {
    if (!isSettingsLoaded) {
      fetchSettings();
    }
  }, [isSettingsLoaded, fetchSettings]);

  // Initialize auth session
  useEffect(() => {
    if (!isInitialized) {
      fetchUser();
    }
  }, [isInitialized, fetchUser]);

  // Sync zustand client counts without hydration mismatch
  useEffect(() => {
    setCartCount(getItemCount());
  }, [getItemCount]);

  useEffect(() => {
    setWishCount(wishlistCount);
  }, [wishlistCount]);

  // Listen to scroll to activate sticky glass effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search input when open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
  }, [isSearchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsMegaMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
    }

  };

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Sản phẩm', href: '/san-pham', hasMega: true },
    { label: 'Bộ sưu tập mới', href: '/san-pham?sort=new', badge: 'Mới' },
    { label: 'Bán chạy', href: '/san-pham?sort=bestseller' },
    { label: 'Khuyến mãi', href: '/san-pham?sort=discount', isSpecial: true },
    { label: 'Bài viết', href: '/bai-viet' },
    { label: 'Liên hệ', href: '/lien-he' },
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        )}
      >
        {/* TOP BAR (Desktop Only) */}
        <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-2 border-b border-slate-800">
          <div className="container-luxe mx-auto flex items-center justify-between">
            {/* Contact info */}
            <div className="flex items-center gap-6">
              <a
                href={`tel:${settings.contactPhone?.replace(/\s+/g, '') || '19008888'}`}
                className="inline-flex items-center gap-1.5 hover:text-luxury-gold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-luxury-gold" />
                <span>Hotline: {settings.contactPhone || '1900 8888'} (24/7)</span>
              </a>
              <a
                href={`mailto:${settings.contactEmail || 'contact@luxeshop.vn'}`}
                className="inline-flex items-center gap-1.5 hover:text-luxury-gold transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-luxury-gold" />
                <span>{settings.contactEmail || 'support@luxe-shop.vn'}</span>
              </a>
            </div>

            {/* Language & Account Links */}
            <div className="flex items-center gap-5">
              <span className="text-slate-400">Giao hàng miễn phí toàn quốc từ 500k</span>
              <div className="h-3 w-px bg-slate-700" />
              <Link
                href="/tai-khoan/don-hang"
                className="hover:text-luxury-gold text-slate-300 transition-colors flex items-center gap-1"
              >
                <span>Đã mua</span>
              </Link>
              <div className="h-3 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="font-semibold text-white">VI</span>
                <span>/</span>
                <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">EN</span>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/tai-khoan"
                    className="inline-flex items-center gap-1.5 text-white hover:text-luxury-gold transition-colors font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Xin chào, {user.firstName || user.lastName || 'Quý khách'}</span>
                  </Link>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/dang-nhap"
                    className="inline-flex items-center gap-1 hover:text-luxury-gold transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Đăng nhập</span>
                  </Link>
                  <span className="text-slate-600">|</span>
                  <Link
                    href="/dang-ky"
                    className="hover:text-luxury-gold transition-colors font-medium text-white"
                  >
                    <span>Đăng ký</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* MAIN BAR */}
        <div className="container-luxe mx-auto">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-800 hover:text-luxury-gold focus:outline-none"
                aria-label="Mở thực đơn"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* LOGO */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group flex flex-col items-center text-center">
                <span className="font-serif text-2xl sm:text-3xl font-black tracking-widest text-luxury-black group-hover:text-luxury-gold transition-colors">
                  {settings.storeName || 'LUXE'}
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold -mt-1">
                  {settings.storeSlogan ? 'Haute Couture' : 'Haute Couture'}
                </span>
              </Link>
            </div>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href.split('?')[0]);

                if (link.hasMega) {
                  return (
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => setIsMegaMenuOpen(true)}
                      onMouseLeave={() => setIsMegaMenuOpen(false)}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md',
                          isActive
                            ? 'text-luxury-black font-semibold'
                            : 'text-slate-700 hover:text-luxury-black hover:bg-slate-50',
                          isMegaMenuOpen && 'text-luxury-gold'
                        )}
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={cn(
                            'w-3.5 h-3.5 transition-transform duration-200',
                            isMegaMenuOpen && 'rotate-180 text-luxury-gold'
                          )}
                        />
                      </Link>

                      {/* MEGA MENU DROPDOWN */}
                      <AnimatePresence>
                        {isMegaMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-1/2 -translate-x-1/2 top-full w-[940px] xl:w-[1080px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 z-50 overflow-hidden"
                          >
                            <div className="grid grid-cols-5 gap-8">
                              {/* 4 Category Columns */}
                              <div className="col-span-4 grid grid-cols-4 gap-6">
                                {MEGA_CATEGORIES.map((cat) => (
                                  <div key={cat.title} className="space-y-4">
                                    <Link
                                      href={cat.href}
                                      className="font-serif text-base font-bold text-luxury-black hover:text-luxury-gold flex items-center justify-between pb-2 border-b border-gray-100 transition-colors"
                                    >
                                      <span>{cat.title}</span>
                                    </Link>
                                    <ul className="space-y-2.5">
                                      {cat.items.map((item) => (
                                        <li key={item.name}>
                                          <Link
                                            href={item.href}
                                            className="text-xs text-slate-600 hover:text-luxury-gold hover:translate-x-1 inline-block transition-all duration-200"
                                          >
                                            {item.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>

                              {/* 1 Promotional Card Column */}
                              <div className="col-span-1 rounded-xl bg-gradient-to-br from-luxury-black to-slate-800 text-white p-5 flex flex-col justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-luxury-gold/20 rounded-full blur-2xl" />
                                <div className="relative z-10">
                                  <span className="badge-bestseller mb-3">BST 2026</span>
                                  <h4 className="font-serif text-lg font-bold leading-tight mt-1 text-white">
                                    Hoàng Gia Thu Đông
                                  </h4>
                                  <p className="text-xs text-slate-300 mt-2 line-clamp-3">
                                    Những thiết kế nhung lụa thủ công giới hạn độc bản.
                                  </p>
                                </div>
                                <div className="relative z-10 pt-4">
                                  <Link
                                    href="/san-pham?sort=new"
                                    className="btn-gold w-full text-xs py-2 px-3 justify-center shadow-md flex items-center gap-1.5"
                                  >
                                    <span>Khám phá ngay</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-md',
                      isActive
                        ? 'text-luxury-black font-semibold'
                        : link.isSpecial
                        ? 'text-rose-600 hover:text-rose-700'
                        : 'text-slate-700 hover:text-luxury-black hover:bg-slate-50'
                    )}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-luxury-gold rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT ICONS */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="btn-icon text-slate-700 hover:text-luxury-black"
                aria-label="Tìm kiếm sản phẩm"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist icon (Desktop) */}
              <Link
                href="/yeu-thich"
                className="hidden sm:inline-flex btn-icon text-slate-700 hover:text-luxury-black relative"
                aria-label="Danh sách yêu thích"
              >
                <Heart className="w-5 h-5" />
                {wishCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-luxury-gold text-[10px] font-bold text-white shadow-sm">
                    {wishCount > 9 ? '9+' : wishCount}
                  </span>
                )}
              </Link>

              {/* Account icon & Dropdown */}
              <div className="relative group">
                <Link
                  href={user ? '/tai-khoan' : '/dang-nhap'}
                  className="btn-icon text-slate-700 hover:text-luxury-black relative"
                  title={user ? `Tài khoản (${user.firstName || user.email})` : 'Đăng nhập / Đăng ký'}
                  aria-label="Tài khoản cá nhân"
                >
                  <User className="w-5 h-5" />
                  {user && (
                    <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </Link>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 text-xs">
                    {user ? (
                      <>
                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                          <p className="font-semibold text-slate-900 truncate">
                            {user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || 'Quý khách'}
                          </p>
                          <p className="text-2xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/tai-khoan"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-luxury-black transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-luxury-gold" />
                          <span>Hồ sơ tài khoản</span>
                        </Link>
                        <Link
                          href="/tai-khoan/don-hang"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-luxury-black transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-luxury-gold" />
                          <span>Mục đã mua (Đơn hàng)</span>
                        </Link>
                        <Link
                          href="/yeu-thich"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-luxury-black transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-luxury-gold" />
                          <span>Sản phẩm yêu thích</span>
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => logout()}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                          <p className="font-semibold text-slate-900">Khách hàng LUXE</p>
                          <p className="text-2xs text-slate-500">Đăng nhập để nhận ưu đãi</p>
                        </div>
                        <Link
                          href="/dang-nhap"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-luxury-black hover:bg-slate-50 hover:text-luxury-gold transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Đăng nhập</span>
                        </Link>
                        <Link
                          href="/dang-ky"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <span>Tạo tài khoản mới</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Cart Icon with badge */}
              <button
                type="button"
                onClick={openCart}
                className="btn-icon text-slate-700 hover:text-luxury-black relative"
                aria-label="Mở giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5 text-luxury-black" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-luxury-black text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Search Dialog */}
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-3xl mx-auto mt-16 sm:mt-24 px-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-luxury-gold">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-slate-600">
                      Tìm kiếm sản phẩm đẳng cấp
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                    aria-label="Đóng tìm kiếm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="mt-5 relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm theo tên sản phẩm, bộ sưu tập, chất liệu..."
                      className="w-full pl-12 pr-28 py-4 bg-slate-50 border border-gray-200 rounded-xl text-base text-luxury-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 px-5 py-2.5 bg-luxury-black text-white text-xs font-semibold rounded-lg hover:bg-luxury-gold transition-colors"
                    >
                      Tìm kiếm
                    </button>
                  </div>
                </form>

                {/* Popular Keywords */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Từ khóa phổ biến:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          setIsSearchOpen(false);
                          router.push(`/tim-kiem?q=${encodeURIComponent(tag)}`);
                        }}

                        className="px-3 py-1.5 bg-slate-100 hover:bg-luxury-cream text-xs rounded-full text-slate-700 hover:text-luxury-black transition-colors border border-transparent hover:border-luxury-gold/30"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Menu Slide-in Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header inside mobile menu */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-serif text-xl font-black tracking-widest text-luxury-black"
                >
                  LUXE <span className="text-luxury-gold text-xs font-sans tracking-widest">SHOP</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Đóng thực đơn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile search bar */}
              <div className="p-4 border-b border-gray-100">
                <form
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm text-slate-800 placeholder:text-gray-400 focus:bg-white focus:border-luxury-gold focus:outline-none"
                  />
                </form>
              </div>

              {/* Navigation links & accordion */}
              <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-gray-100">
                <div className="py-2 space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-luxury-black hover:bg-slate-50"
                  >
                    Trang chủ
                  </Link>

                  {/* Mega categories accordion for mobile */}
                  <div className="rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedCat(
                          mobileExpandedCat === 'products' ? null : 'products'
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-luxury-black hover:bg-slate-50"
                    >
                      <span>Sản phẩm & Danh mục</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform duration-200 text-gray-500',
                          mobileExpandedCat === 'products' && 'rotate-180 text-luxury-gold'
                        )}
                      />
                    </button>

                    {mobileExpandedCat === 'products' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pl-4 pr-2 py-2 space-y-3 bg-slate-50/70 rounded-lg my-1"
                      >
                        {MEGA_CATEGORIES.map((cat) => (
                          <div key={cat.title} className="space-y-1.5">
                            <Link
                              href={cat.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-xs font-bold text-luxury-black block hover:text-luxury-gold"
                            >
                              {cat.title}
                            </Link>
                            <div className="pl-2 space-y-1">
                              {cat.items.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="text-xs text-slate-600 block hover:text-luxury-gold py-0.5"
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <Link
                    href="/san-pham?sort=new"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-luxury-black hover:bg-slate-50"
                  >
                    <span>Bộ sưu tập mới</span>
                    <span className="badge-new">NEW</span>
                  </Link>

                  <Link
                    href="/san-pham?sort=bestseller"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-luxury-black hover:bg-slate-50"
                  >
                    Bán chạy nhất
                  </Link>

                  <Link
                    href="/san-pham?sort=discount"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <span>Ưu đãi đặc biệt</span>
                    <span className="badge-sale">HOT</span>
                  </Link>

                  <Link
                    href="/bai-viet"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-luxury-black hover:bg-slate-50"
                  >
                    Tạp chí phong cách
                  </Link>

                  <Link
                    href="/lien-he"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-luxury-black hover:bg-slate-50"
                  >
                    Liên hệ & Hỗ trợ
                  </Link>
                </div>

                {/* Additional mobile links */}
                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <a
                    href={`tel:${settings.contactPhone?.replace(/\s+/g, '') || '19008888'}`}
                    className="flex items-center gap-2 px-3 py-1.5 hover:text-luxury-gold"
                  >
                    <Phone className="w-4 h-4 text-luxury-gold" />
                    <span>Hotline: {settings.contactPhone || '1900 8888'}</span>
                  </a>
                  <a
                    href={`mailto:${settings.contactEmail || 'contact@luxeshop.vn'}`}
                    className="flex items-center gap-2 px-3 py-1.5 hover:text-luxury-gold"
                  >
                    <Mail className="w-4 h-4 text-luxury-gold" />
                    <span>{settings.contactEmail || 'support@luxe-shop.vn'}</span>
                  </a>
                </div>
              </div>

              {/* Bottom auth links in mobile menu */}
              <div className="p-4 border-t border-gray-100 bg-slate-50">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="h-10 w-10 rounded-full bg-luxury-black text-luxury-gold font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user.firstName} {user.lastName || ''}
                        </p>
                        <p className="text-2xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/tai-khoan"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="btn-outline text-center text-xs py-2 justify-center flex items-center gap-1 border-slate-300"
                      >
                        <User className="w-3.5 h-3.5 text-luxury-gold" />
                        <span>Tài khoản</span>
                      </Link>
                      <Link
                        href="/tai-khoan/don-hang"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="btn-outline text-center text-xs py-2 justify-center flex items-center gap-1 border-slate-300"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-luxury-gold" />
                        <span>Mục đã mua</span>
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full rounded-lg bg-rose-50 text-rose-700 py-2.5 text-xs font-semibold hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors border border-rose-200"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href="/dang-nhap"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-primary flex-1 text-center text-xs py-2.5 justify-center flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Đăng nhập</span>
                    </Link>
                    <Link
                      href="/dang-ky"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn-outline flex-1 text-center text-xs py-2.5 justify-center flex items-center gap-1.5 border-slate-300 hover:border-luxury-gold"
                    >
                      <span>Đăng ký</span>
                    </Link>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
}
