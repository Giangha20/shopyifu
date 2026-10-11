'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  icon,
  title = 'Đã có lỗi xảy ra',
  description = 'Không thể tải dữ liệu vào lúc này. Vui lòng kiểm tra lại kết nối và thử lại.',
  retryLabel = 'Thử lại',
  onRetry,
  isRetrying = false,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/30 px-6 py-12 text-center sm:py-16',
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600 mb-4 ring-8 ring-rose-50">
        {icon || <AlertCircle className="h-7 w-7 stroke-[1.75]" />}
      </div>

      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-luxury-black">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      )}

      {onRetry && (
        <div className="mt-6">
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            isLoading={isRetrying}
            variant="outline"
            className="border-slate-300 hover:border-luxury-black"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRetrying && 'animate-spin')} />
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
