'use client';

import * as React from 'react';
import { cn, formatPrice, getDiscountPercentage } from '@/lib/utils';
import { Badge } from './badge';

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {
  price: number | string | null | undefined;
  compareAtPrice?: number | string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscountBadge?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function Price({
  price,
  compareAtPrice,
  size = 'md',
  showDiscountBadge = true,
  orientation = 'horizontal',
  className,
  ...props
}: PriceProps) {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
  const numericCompareAt =
    typeof compareAtPrice === 'string' ? parseFloat(compareAtPrice) : (compareAtPrice ?? 0);

  const hasDiscount = numericCompareAt > numericPrice && numericPrice > 0;
  const discountPercent = hasDiscount
    ? getDiscountPercentage(numericPrice, numericCompareAt)
    : 0;

  const sizeClasses = {
    sm: {
      current: 'text-sm font-semibold',
      compare: 'text-xs',
      badge: 'text-2xs px-1.5 py-0',
    },
    md: {
      current: 'text-base font-bold',
      compare: 'text-xs sm:text-sm',
      badge: 'text-2xs px-2 py-0.5',
    },
    lg: {
      current: 'text-xl sm:text-2xl font-bold',
      compare: 'text-sm sm:text-base',
      badge: 'text-xs px-2.5 py-0.5',
    },
    xl: {
      current: 'text-2xl sm:text-3xl font-extrabold',
      compare: 'text-base sm:text-lg',
      badge: 'text-xs px-2.5 py-0.5',
    },
  };

  return (
    <div
      className={cn(
        'inline-flex items-baseline',
        orientation === 'vertical' ? 'flex-col items-start gap-0.5' : 'flex-wrap items-center gap-2',
        className
      )}
      {...props}
    >
      <span className={cn('text-luxury-black font-sans tracking-tight', sizeClasses[size].current)}>
        {formatPrice(numericPrice)}
      </span>

      {hasDiscount && (
        <span
          className={cn(
            'text-slate-400 line-through font-normal select-none',
            sizeClasses[size].compare
          )}
        >
          {formatPrice(numericCompareAt)}
        </span>
      )}

      {hasDiscount && showDiscountBadge && discountPercent > 0 && (
        <Badge variant="sale" className={sizeClasses[size].badge}>
          -{discountPercent}%
        </Badge>
      )}
    </div>
  );
}
