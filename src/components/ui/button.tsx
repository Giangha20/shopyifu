'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-300 ease-luxury focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        default:
          'bg-luxury-black text-white hover:bg-luxury-black-light hover:shadow-luxury-lg',
        primary:
          'bg-luxury-black text-white hover:bg-luxury-black-light hover:shadow-luxury-lg',
        gold:
          'bg-luxury-gold text-white hover:bg-luxury-gold-dark hover:shadow-glow',
        outline:
          'border-2 border-luxury-black text-luxury-black bg-transparent hover:bg-luxury-black hover:text-white',
        ghost:
          'text-slate-700 bg-transparent hover:bg-slate-100 hover:text-luxury-black',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md focus-visible:ring-rose-500/50',
        link:
          'text-luxury-gold underline-offset-4 hover:underline p-0 h-auto font-normal active:scale-100',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-5 text-sm gap-2',
        lg: 'h-12 px-7 text-base gap-2.5',
        xl: 'h-14 px-9 text-lg gap-3',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      isSuccess = false,
      loadingText,
      successText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || isLoading || isSuccess;

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : isSuccess ? (
          <>
            <Check className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{successText || children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
