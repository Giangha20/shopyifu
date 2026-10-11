'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  createPageUrl?: (page: number) => string;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  createPageUrl,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate pagination range
  const generateRange = () => {
    const totalNumbers = siblingCount * 2 + 3; // current + siblings + first + last
    const totalBlocks = totalNumbers + 2; // totalNumbers + 2 dots

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'DOTS_RIGHT', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, 'DOTS_LEFT', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, 'DOTS_LEFT', ...middleRange, 'DOTS_RIGHT', totalPages];
    }

    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const pages = generateRange();

  const renderItem = (page: number | string, index: number) => {
    if (typeof page === 'string') {
      return (
        <li key={`dots-${page}-${index}`} className="flex h-10 w-10 items-center justify-center text-slate-400">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Thêm trang</span>
        </li>
      );
    }

    const isCurrent = page === currentPage;
    const itemClassName = cn(
      'flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all duration-200 select-none',
      isCurrent
        ? 'bg-luxury-black text-white shadow-sm'
        : 'text-slate-700 hover:bg-slate-100 hover:text-luxury-black active:scale-95'
    );

    if (createPageUrl) {
      return (
        <li key={page}>
          <Link
            href={createPageUrl(page)}
            className={itemClassName}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => onPageChange?.(page)}
          >
            {page}
          </Link>
        </li>
      );
    }

    return (
      <li key={page}>
        <button
          type="button"
          onClick={() => onPageChange?.(page)}
          className={itemClassName}
          aria-current={isCurrent ? 'page' : undefined}
        >
          {page}
        </button>
      </li>
    );
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      role="navigation"
      aria-label="Phân trang"
      className={cn('flex items-center justify-center space-x-1 sm:space-x-2 my-8', className)}
      {...props}
    >
      <ul className="flex items-center space-x-1 sm:space-x-1.5">
        {/* Previous button */}
        <li>
          {createPageUrl && hasPrev ? (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="flex h-10 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Trang trước"
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trước</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="flex h-10 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trước</span>
            </button>
          )}
        </li>

        {/* Page numbers */}
        {pages.map((p, idx) => renderItem(p, idx))}

        {/* Next button */}
        <li>
          {createPageUrl && hasNext ? (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="flex h-10 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Trang sau"
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="flex h-10 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Trang sau"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}
