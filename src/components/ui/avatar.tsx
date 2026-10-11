'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-transparent transition-all',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-2xs',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl font-bold',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
}

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, src, alt = 'Avatar', fallbackText, children, ...props }, ref) => {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-brand-100 font-medium text-luxury-black uppercase tracking-wider select-none'
        )}
      >
        {fallbackText ? (
          fallbackText.slice(0, 2).toUpperCase()
        ) : (
          alt.slice(0, 2).toUpperCase()
        )}
      </AvatarPrimitive.Fallback>
      {children}
    </AvatarPrimitive.Root>
  );
});

Avatar.displayName = 'Avatar';

export const AvatarImage = AvatarPrimitive.Image;
export const AvatarFallback = AvatarPrimitive.Fallback;
