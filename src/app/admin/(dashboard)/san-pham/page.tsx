'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        q: search,
        search,
        status,
      });

      const res = await fetch(`/api/admin/products?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data.products || data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, status]);

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentActive } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Sản phẩm',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <img
              src={row.images[0]?.url || '/placeholder.jpg'}
              alt={row.name}
              className="h-full w-full object-cover"
              onError={(e: any) => {
                e.target.src = '/placeholder.jpg';
              }}
            />
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/san-pham/${row.id}`}
              className="font-medium text-slate-900 hover:text-luxury-gold truncate block"
            >
              {row.name}
            </Link>
            <div className="flex items-center gap-2 text-2xs text-slate-400">
              <span className="font-mono">SKU: {row.sku}</span>
              {row.categories?.length > 0 && (
                <span>• {row.categories.map((c: any) => c.name).join(', ')}</span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Giá bán',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900">{formatPrice(row.price)}</span>
          {row.compareAtPrice && (
            <span className="block text-2xs text-slate-400 line-through">
              {formatPrice(row.compareAtPrice)}
            </span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Tồn kho',
      cell: (row) => (
        <div>
          <span
            className={`font-semibold ${
              row.quantity <= 5 ? 'text-rose-600' : 'text-slate-800'
            }`}
          >
            {row.quantity}
          </span>
          <span className="block text-2xs text-slate-400">Đã bán: {row.soldCount}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Trạng thái',
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id, row.isActive)}
          className="inline-flex items-center gap-1.5 cursor-pointer"
        >
          {row.isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
              <CheckCircle className="h-3 w-3" />
              Đang bán
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-200">
              <XCircle className="h-3 w-3" />
              Tạm ẩn
            </span>
          )}
        </button>
      ),
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/san-pham/${row.id}`}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <Link
            href={`/san-pham/${row.slug}`}
            target="_blank"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
            title="Xem trên web"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Sản Phẩm
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Danh sách tất cả sản phẩm thời trang cao cấp trên hệ thống.
          </p>
        </div>

        <Link href="/admin/san-pham/them">
          <Button className="bg-luxury-black text-white hover:bg-luxury-black-light shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={loading}
        searchPlaceholder="Tìm kiếm tên, SKU..."
        searchValue={search}
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-luxury-gold focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Tạm ẩn</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
