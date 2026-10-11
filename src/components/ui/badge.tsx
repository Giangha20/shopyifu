'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors select-none text-xs px-2.5 py-0.5 tracking-wide',
  {
    variants: {
      variant: {
        default:
          'bg-slate-100 text-slate-800 border border-slate-200',
        new:
          'bg-emerald-500 text-white font-semibold uppercase text-2xs tracking-wider shadow-sm',
        sale:
          'bg-rose-500 text-white font-semibold uppercase text-2xs tracking-wider shadow-sm',
        bestseller:
          'bg-luxury-gold text-white font-semibold uppercase text-2xs tracking-wider shadow-glow',
        outline:
          'border border-slate-300 text-slate-700 bg-transparent',
        success:
          'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning:
          'bg-amber-50 text-amber-700 border border-amber-200',
        error:
          'bg-rose-50 text-rose-700 border border-rose-200',
      },
      size: {
        sm: 'text-2xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon && <span className="mr-1 inline-flex shrink-0">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
