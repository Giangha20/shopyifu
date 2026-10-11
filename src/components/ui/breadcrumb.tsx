'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />,
  showHome = true,
  className,
  ...props
}: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Trang chủ', href: '/', icon: <Home className="h-3.5 w-3.5" /> }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-xs text-slate-500 overflow-x-auto py-2', className)}
      {...props}
    >
      <ol className="inline-flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 sm:gap-2">
              {index > 0 && <span aria-hidden="true">{separator}</span>}

              {isLast || !item.href ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 font-medium',
                    isLast ? 'text-luxury-black font-semibold' : 'text-slate-500'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-luxury-gold transition-colors duration-200"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
