'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const spinnerVariants = cva('animate-spin text-current', {
  variants: {
    size: {
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      default: 'text-current',
      gold: 'text-luxury-gold',
      black: 'text-luxury-black',
      white: 'text-white',
      muted: 'text-slate-400',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
});

export interface SpinnerProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}


export function Spinner({
  className,
  size,
  color,
  label = 'Đang tải...',
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      className="inline-flex items-center justify-center"
      aria-label={label}
    >
      <svg
        className={cn(spinnerVariants({ size, color }), className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
