'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, AlertCircle, Phone } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = React.useState(false);

  useEffect(() => {
    // Log the error for diagnostics
    console.error('Unhandled app error:', error);

    try {
      fetch('/api/debug-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: error?.name,
          message: error?.message,
          digest: error?.digest,
          stack: error?.stack,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    // Auto-retry once for transient network drop or chunk load errors
    try {
      const hasRetried = sessionStorage.getItem('auto_retry_once');
      const isTransient =
        error?.message?.includes('fetch') ||
        error?.message?.includes('chunk') ||
        error?.message?.includes('Network') ||
        error?.name === 'ChunkLoadError';

      if (isTransient && !hasRetried) {
        sessionStorage.setItem('auto_retry_once', '1');
        setIsRetrying(true);
        const timer = setTimeout(() => {
          reset();
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        sessionStorage.removeItem('auto_retry_once');
      }
    } catch {
      // Ignore sessionStorage issues in restricted contexts
    }
  }, [error, reset]);

  const handleManualRetry = () => {
    setIsRetrying(true);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
      } catch {}
      window.location.reload();
    } else {
      reset();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-glow">
          <AlertCircle className="h-8 w-8" />
        </div>

        <span className="text-2xs font-bold uppercase tracking-widest text-amber-600 block">
          ĐANG TỐI ƯU KẾT NỐI MẠNG
        </span>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black">
          Kết Nối Đang Được Tải Lại
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Đường truyền mạng vừa có dao động nhỏ hoặc máy chủ cơ sở dữ liệu đang thức dậy. Quý khách vui lòng thử tải lại trang hoặc chờ trong giây lát.
        </p>

        {error?.message && (
          <div className="text-left bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-auto max-h-32 border border-slate-800">
            <p className="text-rose-400 font-bold">{error.name || 'Error'}: {error.message}</p>
            {error.digest && <p className="text-slate-400 text-[10px] mt-1">Digest: {error.digest}</p>}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            disabled={isRetrying}
            onClick={handleManualRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-luxury-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-luxury-lg hover:bg-luxury-black-light transition-all disabled:opacity-75"
          >
            <RotateCcw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Đang kết nối lại...' : 'Tải lại trang ngay'}</span>
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Home className="h-4 w-4" />
            <span>Về trang chủ</span>
          </button>
        </div>

        <div className="pt-6 border-t border-gray-100 text-2xs text-slate-400">
          Cần hỗ trợ gấp? Gọi ngay Hotline VIP:{' '}
          <a href="tel:1900888999" className="font-bold text-luxury-gold hover:underline">
            1900 888 999
          </a>
        </div>
      </div>
    </div>
  );
}
