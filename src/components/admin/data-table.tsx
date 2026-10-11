'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  Inbox,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  searchValue?: string;
  enableSelection?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  toolbarActions?: React.ReactNode;
  filterComponent?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Không tìm thấy dữ liệu',
  searchPlaceholder = 'Tìm kiếm...',
  onSearch,
  searchValue,
  enableSelection = false,
  selectedIds = [],
  onSelectChange,
  getRowId = (row) => row.id || '',
  page = 1,
  totalPages = 1,
  totalItems,
  onPageChange,
  toolbarActions,
  filterComponent,
  onRowClick,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState(searchValue || '');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectChange) return;
    if (e.target.checked) {
      const allIds = data.map(getRowId);
      onSelectChange(allIds);
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectChange) return;
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const isAllSelected = data.length > 0 && data.every((row) => selectedIds.includes(getRowId(row)));

  return (
    <div className="w-full space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {onSearch && (
            <div className="relative w-full max-w-sm">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue !== undefined ? searchValue : internalSearch}
                onChange={(e) => {
                  setInternalSearch(e.target.value);
                  onSearch(e.target.value);
                }}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                className="h-9 text-xs"
              />
            </div>
          )}
          {filterComponent}
        </div>

        {toolbarActions && (
          <div className="flex items-center gap-2 shrink-0">{toolbarActions}</div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                {enableSelection && (
                  <th className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-luxury-gold focus:ring-luxury-gold/30"
                    />
                  </th>
                )}
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className={cn('px-4 py-3.5 whitespace-nowrap', column.className)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <ArrowUpDown className="h-3 w-3 text-slate-400 hover:text-slate-700 cursor-pointer" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (enableSelection ? 1 : 0)}
                    className="py-16 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-luxury-gold" />
                      <span className="text-xs">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (enableSelection ? 1 : 0)}
                    className="py-16 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-8 w-8 text-slate-300" />
                      <span className="text-sm font-medium">{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => {
                  const id = getRowId(row);
                  const isSelected = selectedIds.includes(id);

                  return (
                    <tr
                      key={id || rowIdx}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={cn(
                        'transition-colors duration-150 hover:bg-slate-50/80',
                        isSelected && 'bg-amber-50/40',
                        onRowClick && 'cursor-pointer'
                      )}
                    >
                      {enableSelection && (
                        <td
                          className="w-12 px-4 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(id, e as any)}
                            className="h-4 w-4 rounded border-slate-300 text-luxury-gold focus:ring-luxury-gold/30"
                          />
                        </td>
                      )}
                      {columns.map((column, colIdx) => {
                        return (
                          <td
                            key={colIdx}
                            className={cn('px-4 py-3 align-middle', column.className)}
                          >
                            {column.cell
                              ? column.cell(row)
                              : column.accessorKey
                              ? String(row[column.accessorKey] ?? '—')
                              : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-600">
            <div>
              {totalItems !== undefined ? (
                <span>
                  Tổng cộng <strong className="text-slate-900">{totalItems}</strong> mục (Trang {page} / {totalPages})
                </span>
              ) : (
                <span>
                  Trang {page} trên {totalPages}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={page <= 1}
                className="h-8 w-8 p-0"
                aria-label="Trang đầu"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="h-8 w-8 p-0"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <span className="px-2 font-medium text-slate-900">
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="h-8 w-8 p-0"
                aria-label="Trang sau"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={page >= totalPages}
                className="h-8 w-8 p-0"
                aria-label="Trang cuối"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
