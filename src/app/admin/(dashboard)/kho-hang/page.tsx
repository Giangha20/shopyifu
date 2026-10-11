'use client';

import React, { useEffect, useState } from 'react';
import {
  Warehouse,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  History,
  X,
  Loader2,
} from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Adjust stock modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQty, setAdjustQty] = useState('10');
  const [adjustReason, setAdjustReason] = useState('Nhập hàng bổ sung');
  const [adjustNote, setAdjustNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        lowStock: lowStockOnly ? 'true' : 'false',
      });

      const res = await fetch(`/api/admin/inventory?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
        setMovements(data.recentMovements || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, search, lowStockOnly]);

  const openAdjustModal = (item: any) => {
    setSelectedProduct(item);
    setAdjustType('in');
    setAdjustQty('10');
    setAdjustReason('Nhập hàng bổ sung');
    setAdjustNote('');
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantityChange: Number(adjustQty),
          type: adjustType,
          reason: adjustReason,
          note: adjustNote,
        }),
      });

      if (!res.ok) throw new Error('Failed to adjust');
      setModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi điều chỉnh kho');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Sản phẩm',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            <img
              src={row.image}
              alt={row.name}
              className="h-full w-full object-cover"
              onError={(e: any) => {
                e.target.src = '/placeholder.jpg';
              }}
            />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="text-2xs font-mono text-slate-400">SKU: {row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Tồn kho hiện tại',
      cell: (row) => {
        const isLow = row.quantity <= row.lowStockThreshold;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${
                row.quantity === 0
                  ? 'text-rose-600'
                  : isLow
                  ? 'text-amber-600'
                  : 'text-slate-900'
              }`}
            >
              {row.quantity} cái
            </span>
            {isLow && (
              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-2xs font-semibold text-rose-600">
                Sắp hết
              </span>
            )}
          </div>
        );
      },
      sortable: true,
    },
    {
      header: 'Đã bán',
      cell: (row) => <span className="font-medium text-slate-700">{row.soldCount}</span>,
      sortable: true,
    },
    {
      header: 'Hành động',
      className: 'text-right',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openAdjustModal(row)}
          className="h-8 gap-1 text-xs"
        >
          <Sliders className="h-3.5 w-3.5" />
          Điều chỉnh
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
          Quản Lý Kho Hàng & Tồn Kho
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Theo dõi số lượng hàng thực tế, cảnh báo hết hàng và nhật ký xuất nhập kho.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Table Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <DataTable
            columns={columns}
            data={inventory}
            isLoading={loading}
            searchPlaceholder="Tìm mã SKU hoặc tên sản phẩm..."
            searchValue={search}
            onSearch={(term) => {
              setSearch(term);
              setPage(1);
            }}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            filterComponent={
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500/20"
                />
                <span>Chỉ hiện sản phẩm sắp hết</span>
              </label>
            }
          />
        </div>

        {/* Stock Movements History (1 col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <History className="h-4 w-4 text-slate-400" />
            <h2 className="text-base font-bold text-slate-900">Lịch sử xuất nhập gần đây</h2>
          </div>

          <div className="space-y-3">
            {movements.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Chưa có biến động kho</p>
            ) : (
              movements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900">{m.productName}</p>
                    <p className="text-2xs text-slate-500">
                      {m.reason} • {formatDateTime(m.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-2xs font-bold ${
                      m.type === 'in'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {m.type === 'in' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {m.type === 'in' ? `+${m.quantity}` : `-${m.quantity}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Điều chỉnh số lượng kho
              </h3>
              <button onClick={() => setModalOpen(false)} className="rounded p-1 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500">Sản phẩm:</p>
                <p className="font-bold text-slate-900 text-sm">{selectedProduct?.name}</p>
                <p className="text-2xs text-slate-400 font-mono">
                  Tồn kho hiện tại: {selectedProduct?.quantity}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustType('in')}
                  className={`rounded-xl border p-3 text-center text-xs font-semibold transition-all ${
                    adjustType === 'in'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Nhập thêm kho (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('out')}
                  className={`rounded-xl border p-3 text-center text-xs font-semibold transition-all ${
                    adjustType === 'out'
                      ? 'border-rose-500 bg-rose-50 text-rose-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Xuất giảm kho (-)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Số lượng điều chỉnh *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Lý do điều chỉnh</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                >
                  <option value="Nhập hàng bổ sung">Nhập hàng bổ sung</option>
                  <option value="Kiểm kê kho sai lệch">Kiểm kê kho sai lệch</option>
                  <option value="Hàng lỗi / Hư hỏng">Hàng lỗi / Hư hỏng</option>
                  <option value="Trả lại nhà cung cấp">Trả lại nhà cung cấp</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Ghi chú bổ sung</label>
                <textarea
                  rows={2}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="bg-luxury-black text-white hover:bg-luxury-black-light"
                >
                  {saving && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                  Xác nhận điều chỉnh
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
