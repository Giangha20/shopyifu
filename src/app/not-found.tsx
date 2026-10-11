import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Search, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-luxury-cream/40 flex items-center justify-center px-4 py-20">
      <div className="max-w-xl w-full text-center space-y-6">
        <span className="text-2xs font-bold uppercase tracking-widest text-luxury-gold">
          LỖI 404 • KHÔNG TÌM THẤY TRANG
        </span>

        <h1 className="font-serif text-6xl sm:text-8xl font-bold text-luxury-black tracking-tight">
          404
        </h1>

        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-800">
          Trang Quý Khách Yêu Cầu Không Tồn Tại
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          Đường dẫn có thể đã thay đổi hoặc trang này tạm thời không khả dụng. Mời quý khách tiếp tục khám phá các tuyệt tác khác tại LUXE SHOP.
        </p>

        {/* Suggestion Navigation */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-luxury-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-luxury-lg hover:bg-luxury-black-light transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Link>

          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Xem sản phẩm</span>
          </Link>
        </div>

        {/* Helpful links */}
        <div className="pt-8 border-t border-gray-200/80 text-xs text-slate-500 flex flex-wrap justify-center gap-4">
          <Link href="/danh-muc/dam-vay-thiet-ke" className="hover:text-luxury-gold transition-colors">
            Đầm &amp; Váy Thiết Kế
          </Link>
          <span>•</span>
          <Link href="/danh-muc/tui-xach-da" className="hover:text-luxury-gold transition-colors">
            Túi Xách Da Cao Cấp
          </Link>
          <span>•</span>
          <Link href="/lien-he" className="hover:text-luxury-gold transition-colors">
            Trung Tâm Hỗ Trợ
          </Link>
        </div>
      </div>
    </div>
  );
}
