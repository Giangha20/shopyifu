import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Xác thực tài khoản | LUXE SHOP',
  description: 'Đăng nhập hoặc đăng ký tài khoản thành viên tại LUXE SHOP để trải nghiệm mua sắm thời trang cao cấp.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-slate-900 via-luxury-black to-slate-950 text-slate-100 overflow-x-hidden">
      {/* Decorative ambient gradient blooms */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />

      {/* Subtle luxury geometric grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #C9A96E 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Header bar */}
      <header className="relative z-10 w-full px-6 py-6 sm:px-12 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400 transition-colors hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Quay lại trang chủ</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-amber-500/80 font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Haute Couture & Luxury Living</span>
        </div>
      </header>

      {/* Main Centered Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Brand Logo & Tagline */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg p-1"
            >
              <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.25em] font-bold text-white transition-all duration-300 group-hover:text-amber-400">
                LUXE SHOP
              </h1>
            </Link>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/40" />
              <span className="text-2xs uppercase tracking-[0.3em] text-amber-400/90 font-medium">
                VIETNAM LUXURY
              </span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/40" />
            </div>
          </div>

          {/* Child Card Content */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/60">
            {children}
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} LUXE SHOP. All rights reserved. Đẳng cấp thời trang thượng lưu.</p>
      </footer>
    </div>
  );
}
