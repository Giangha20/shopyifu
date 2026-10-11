'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;

  max?: number;
  precision?: 0.5 | 1;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  reviewCount?: number;
}

export function Rating({
  value = 0,
  max = 5,
  precision = 0.5,
  onChange,
  readOnly = false,
  size = 'md',
  showScore = false,
  reviewCount,
  className,
  ...props
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const activeValue = hoverValue !== null ? hoverValue : value;

  const handlePointerMove = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = precision === 0.5 && e.clientX - rect.left < rect.width / 2;
    setHoverValue(index + (isHalf ? 0.5 : 1));
  };

  const handleClick = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = precision === 0.5 && e.clientX - rect.left < rect.width / 2;
    onChange(index + (isHalf ? 0.5 : 1));
  };

  return (
    <div
      className={cn('inline-flex items-center gap-1.5 select-none', className)}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
      {...props}
    >
      <div className="flex items-center gap-0.5" role={readOnly ? 'img' : 'radiogroup'} aria-label={`Đánh giá: ${value} trên ${max} sao`}>
        {Array.from({ length: max }).map((_, index) => {
          const starNumber = index + 1;
          const fillPercentage = Math.max(0, Math.min(100, (activeValue - index) * 100));

          if (readOnly) {
            return (
              <div key={index} className="relative inline-block leading-none">
                {/* Empty background star */}
                <Star
                  className={cn(starSizes[size], 'text-gray-200 fill-gray-200 stroke-transparent')}
                />
                {/* Filled foreground star with clip */}
                {fillPercentage > 0 && (
                  <div
                    className="absolute top-0 left-0 overflow-hidden leading-none"
                    style={{ width: `${fillPercentage}%` }}
                  >
                    <Star
                      className={cn(starSizes[size], 'text-luxury-gold fill-luxury-gold stroke-transparent')}
                    />
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              className="relative inline-block p-0.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold cursor-pointer transition-transform hover:scale-110 active:scale-95"
              onMouseMove={(e) => handlePointerMove(index, e)}
              onClick={(e) => handleClick(index, e)}
              aria-label={`${starNumber} sao`}
            >
              <div className="relative inline-block leading-none">
                <Star
                  className={cn(starSizes[size], 'text-gray-200 fill-gray-200 stroke-transparent')}
                />
                {fillPercentage > 0 && (
                  <div
                    className="absolute top-0 left-0 overflow-hidden leading-none pointer-events-none"
                    style={{ width: `${fillPercentage}%` }}
                  >
                    <Star
                      className={cn(starSizes[size], 'text-luxury-gold fill-luxury-gold stroke-transparent')}
                    />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold text-slate-800 ml-1">
          {value.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
