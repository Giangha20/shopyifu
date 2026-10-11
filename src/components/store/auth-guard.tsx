'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, type AuthUser } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode | ((user: AuthUser) => React.ReactNode);
  fallbackUrl?: string;
}

export function AuthGuard({ children, fallbackUrl = '/dang-nhap' }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isInitialized, fetchUser } = useAuth();

  React.useEffect(() => {
    if (!isInitialized) {
      fetchUser();
    }
  }, [isInitialized, fetchUser]);

  React.useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      const redirectUrl = `${fallbackUrl}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isInitialized, isLoading, user, router, fallbackUrl, pathname]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-luxury-gold/20" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-luxury-gold" />
          </div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Đang xác thực thông tin...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {typeof children === 'function' ? children(user) : children}
    </>
  );
}
