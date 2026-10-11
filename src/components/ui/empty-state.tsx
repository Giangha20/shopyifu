'use client';

import * as React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  actionNode?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionNode,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50 px-6 py-16 text-center shadow-inner-luxury sm:py-20',
        className
      )}
      {...props}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-luxury-gold shadow-sm ring-8 ring-brand-50/50 mb-5">
        {icon || <PackageOpen className="h-8 w-8 text-luxury-gold stroke-[1.5]" />}
      </div>

      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-luxury-black">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      )}

      {actionNode ? (
        <div className="mt-6">{actionNode}</div>
      ) : actionLabel && (actionHref || onAction) ? (
        <div className="mt-6">
          {actionHref ? (
            <Button asChild variant="primary">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
