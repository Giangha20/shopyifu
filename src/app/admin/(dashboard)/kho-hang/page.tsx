'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Warehouse,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  History,
  X,
  Loader2,
  Upload,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Package,
  Layers,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  soldCount: number;
  image: string;
  variants?: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    color?: string | null;
    size?: string | null;
  }[];
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: string;
  quantity: number;
  reason: string;
  performedBy?: string | null;
  note?: string | null;
  createdAt: string;
}

interface InventoryStats {
  totalProducts: number;
  totalQuantity: number;
  totalSold: number;
  outOfStockCount: number;
  lowStockCount: number;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalQuantity: 0,
    totalSold: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Single Item Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQty, setAdjustQty] = useState('10');
  const [adjustReason, setAdjustReason] = useState('Nhập hàng bổ sung');
  const [adjustNote, setAdjustNote] = useState('');
  const [savingAdjust, setSavingAdjust] = useState(false);

  // Batch Upload / Import Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'adjust_in' | 'adjust_out' | 'set_exact'>('adjust_in');
  const [batchReason, setBatchReason] = useState('Nhập hàng qua file');
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<{ sku: string; quantity: number }[]>([]);
  const [importingBatch, setImportingBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline Quick Edit Map
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [inlineStockVal, setInlineStockVal] = useState<number>(0);
  const [updatingInline, setUpdatingInline] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        search: search.trim(),
        filter: statusFilter,
      });

      const res = await fetch(`/api/admin/inventory?${query.toString()}`);
      if (!res.ok) throw new Error('Không thể tải dữ liệu kho hàng');
      const data = await res.json();
      setInventory(data.inventory || []);
      setMovements(data.recentMovements || []);
      if (data.stats) setStats(data.stats);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải kho hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, search, statusFilter]);

  // Open single item adjust modal
  const openAdjustModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setAdjustType('in');
    setAdjustQty('10');
    setAdjustReason('Nhập hàng bổ sung');
    setAdjustNote('');
    setAdjustModalOpen(true);
  };

  // Submit single item adjust
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setSavingAdjust(true);
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');

      toast.success(
        adjustType === 'in'
          ? `Đã nhập thêm ${adjustQty} sản phẩm vào kho`
          : `Đã xuất giảm ${adjustQty} sản phẩm khỏi kho`
      );
      setAdjustModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi điều chỉnh kho');
    } finally {
      setSavingAdjust(false);
    }
  };

  // Direct quick inline update
  const handleQuickInlineUpdate = async (productId: string, newQty: number) => {
    try {
      setUpdatingInline(true);
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: Math.max(0, newQty),
          reason: 'Cập nhật nhanh trên bảng tồn kho',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');

      toast.success('Đã cập nhật số lượng tồn kho thành công!');
      setEditingStockId(null);
      setInventory((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: Math.max(0, newQty) } : item))
      );
      // Refresh background stats
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật nhanh');
    } finally {
      setUpdatingInline(false);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      toast.info('Đang chuẩn bị file CSV tồn kho...');
      const res = await fetch('/api/admin/inventory?export=csv');
      if (!res.ok) throw new Error('Không thể xuất dữ liệu');
      const data = await res.json();

      const items: InventoryItem[] = data.inventory || [];
      const headers = ['Mã SKU', 'Tên sản phẩm', 'Giá bán', 'Tồn kho', 'Đã bán', 'Định mức tối thiểu', 'Trạng thái'];
      const rows = items.map((i) => {
        const status =
          i.quantity === 0 ? 'Hết hàng' : i.quantity <= i.lowStockThreshold ? 'Sắp hết' : 'Còn hàng';
        return [
          `"${i.sku.replace(/"/g, '""')}"`,
          `"${i.name.replace(/"/g, '""')}"`,
          i.price,
          i.quantity,
          i.soldCount,
          i.lowStockThreshold,
          `"${status}"`,
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_Ton_Kho_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Đã xuất ${items.length} sản phẩm ra file CSV thành công!`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xuất file CSV');
    }
  };

  // Download Sample Template CSV
  const handleDownloadSampleCSV = () => {
    const sampleHeaders = 'Mã SKU,Số lượng,Lý do';
    const sampleData = [
      'AO-SM-001,50,Nhập hàng từ xưởng may',
      'QUAN-JEAN-002,30,Lô hàng mới về',
      'VAY-HOA-003,25,Bổ sung hàng bán chạy',
    ].join('\r\n');
    const content = '\uFEFF' + [sampleHeaders, sampleData].join('\r\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_File_Nhap_Kho.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã tải xuống file mẫu CSV!');
  };

  // Parse Raw Text or CSV File
  const parseBatchText = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const rows: { sku: string; quantity: number }[] = [];

    for (const line of lines) {
      // Skip header if contains 'sku' or 'mã'
      if (/sku|mã|số lượng|quantity/i.test(line)) continue;

      // Split by comma, tab, or semicolon
      const parts = line.split(/[,;\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        const sku = parts[0];
        const qty = parseInt(parts[1], 10);
        if (sku && !isNaN(qty)) {
          rows.push({ sku, quantity: qty });
        }
      }
    }
    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      const parsed = parseBatchText(content);
      setParsedRows(parsed);
      toast.info(`Đã đọc ${parsed.length} dòng dữ liệu từ file ${file.name}`);
    };
    reader.readAsText(file, 'utf-8');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Batch Upload
  const handleBatchImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rowsToProcess = parsedRows.length > 0 ? parsedRows : parseBatchText(rawText);

    if (rowsToProcess.length === 0) {
      toast.error('Vui lòng nhập hoặc tải file chứa ít nhất 1 dòng SKU và số lượng hợp lệ');
      return;
    }

    try {
      setImportingBatch(true);
      const batchPayload = rowsToProcess.map((r) => ({
        sku: r.sku,
        quantity: r.quantity,
        type: uploadMode === 'adjust_out' ? 'out' : 'in',
        mode: uploadMode === 'set_exact' ? 'set' : 'adjust',
        reason: batchReason || 'Nhập kho qua file tải lên',
      }));

      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: batchPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật hàng loạt thất bại');

      toast.success(data.message || 'Cập nhật kho hàng loạt thành công!');
      setUploadModalOpen(false);
      setRawText('');
      setParsedRows([]);
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi nhập kho hàng loạt');
    } finally {
      setImportingBatch(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Warehouse className="w-6 h-6 text-luxury-gold" />
            <span>Quản Lý Kho Hàng & Tồn Kho</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Theo dõi số lượng hàng thực tế, cập nhật tồn kho qua file, cảnh báo hết hàng và lịch sử xuất nhập kho.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchInventory}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-luxury-gold' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:border-gray-300"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất file tồn kho (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRawText('');
              setParsedRows([]);
              setUploadModalOpen(true);
            }}
            className="btn-gold px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>+ Nhập kho qua file Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tổng mặt hàng</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalProducts}</div>
          <p className="text-[10px] text-slate-400">Đang lưu hành trong kho</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tổng tồn kho</span>
            <Layers className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="text-2xl font-bold text-luxury-gold">{stats.totalQuantity.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400">Cái / chiếc toàn hệ thống</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sắp hết hàng</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.lowStockCount}</div>
          <p className="text-[10px] text-amber-600/80">Số lượng ≤ 10 cái</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Đã hết hàng</span>
            <X className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.outOfStockCount}</div>
          <p className="text-[10px] text-rose-600/80">Tồn kho = 0</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Đã bán ra</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.totalSold.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400">Lũy kế đơn thành công</p>
        </div>
      </div>

      {/* MAIN CONTENT: TABLE & MOVEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INVENTORY TABLE (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          {/* SEARCH & FILTER TOOLBAR */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm mã SKU hoặc tên sản phẩm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tất cả ({totalItems})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('in_stock');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'in_stock'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                Còn hàng
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('low_stock');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'low_stock'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Sắp hết ({stats.lowStockCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('out_of_stock');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  statusFilter === 'out_of_stock'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-600 hover:text-rose-800'
                }`}
              >
                Hết hàng ({stats.outOfStockCount})
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-luxury-gold mx-auto mb-3" />
                <span className="text-xs font-semibold">Đang tải dữ liệu tồn kho...</span>
              </div>
            ) : inventory.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <Warehouse className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-slate-700">Không có sản phẩm nào phù hợp</p>
                <p className="text-xs text-slate-400 mt-1">
                  Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc tồn kho
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-4">Sản phẩm & SKU</th>
                      <th className="p-4">Giá niêm yết</th>
                      <th className="p-4">Tồn kho hiện tại</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Đã bán</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventory.map((row) => {
                      const isOutOfStock = row.quantity === 0;
                      const isLowStock = !isOutOfStock && row.quantity <= row.lowStockThreshold;

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* PRODUCT */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-gray-100">
                                <Image
                                  src={row.image || '/placeholder.jpg'}
                                  alt={row.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="max-w-[220px]">
                                <p className="font-semibold text-slate-900 line-clamp-1">{row.name}</p>
                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                  SKU: <span className="font-bold text-slate-600">{row.sku}</span>
                                </p>
                                {row.variants && row.variants.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500 font-medium">
                                      {row.variants.length} biến thể size/màu
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* PRICE */}
                          <td className="p-4 font-semibold text-slate-700">
                            {formatCurrency(row.price)}
                          </td>

                          {/* QUANTITY WITH INLINE QUICK EDIT */}
                          <td className="p-4">
                            {editingStockId === row.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  autoFocus
                                  value={inlineStockVal}
                                  onChange={(e) => setInlineStockVal(parseInt(e.target.value, 10) || 0)}
                                  className="w-20 px-2 py-1 bg-white border border-luxury-gold rounded-lg text-xs font-bold text-center focus:outline-none"
                                />
                                <button
                                  type="button"
                                  disabled={updatingInline}
                                  onClick={() => handleQuickInlineUpdate(row.id, inlineStockVal)}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-2xs font-bold"
                                  title="Lưu"
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStockId(null)}
                                  className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors text-2xs"
                                  title="Hủy"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-bold ${
                                    isOutOfStock
                                      ? 'text-rose-600'
                                      : isLowStock
                                      ? 'text-amber-600'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {row.quantity} cái
                                </span>

                                <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickInlineUpdate(row.id, Math.max(0, row.quantity - 1))}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                                    title="Giảm 1"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickInlineUpdate(row.id, row.quantity + 1)}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                                    title="Tăng 1"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStockId(row.id);
                                      setInlineStockVal(row.quantity);
                                    }}
                                    className="text-[10px] text-luxury-gold underline hover:text-luxury-gold-dark font-medium ml-1"
                                    title="Sửa trực tiếp"
                                  >
                                    Sửa
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* STATUS BADGE */}
                          <td className="p-4">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                                Hết hàng
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                                Sắp hết (&le; {row.lowStockThreshold})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Đang còn hàng
                              </span>
                            )}
                          </td>

                          {/* SOLD */}
                          <td className="p-4 font-semibold text-slate-700">
                            {row.soldCount}
                          </td>

                          {/* ACTIONS */}
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => openAdjustModal(row)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-luxury-gold hover:text-white text-slate-700 rounded-xl font-semibold transition-all text-xs"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Điều chỉnh</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Trang {page} / {totalPages} (Tổng {totalItems} sản phẩm)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 font-semibold"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 font-semibold"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RECENT MOVEMENTS (1 COL) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <History className="w-4 h-4 text-luxury-gold" />
              <span>Lịch sử xuất nhập gần đây</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">20 giao dịch mới nhất</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {movements.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chưa có biến động kho hàng nào được ghi nhận.
              </div>
            ) : (
              movements.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 rounded-xl border border-gray-100/80 text-xs space-y-1 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 line-clamp-1">{m.productName}</p>
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        m.type === 'in'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {m.type === 'in' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {m.type === 'in' ? `+${m.quantity}` : `-${m.quantity}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-600">{m.reason}</span>
                    <span className="text-slate-400 text-[10px] font-mono">
                      {formatDateTime(m.createdAt)}
                    </span>
                  </div>

                  {m.note && (
                    <p className="text-[10px] text-slate-400 italic line-clamp-1 border-t border-gray-200/40 pt-1 mt-1">
                      {m.note}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: SINGLE ITEM ADJUSTMENT */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-luxury-gold" />
                <span>Điều Chỉnh Tồn Kho</span>
              </h3>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-100">
                <p className="text-[11px] text-slate-400">Sản phẩm điều chỉnh:</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedProduct.name}</p>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="font-mono text-slate-500">Mã SKU: {selectedProduct.sku}</span>
                  <span className="font-bold text-slate-800">
                    Hiện có: <span className="text-luxury-gold font-mono">{selectedProduct.quantity}</span> cái
                  </span>
                </div>
              </div>

              {/* CHOOSE TYPE: IN (+) OR OUT (-) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustType('in')}
                  className={`rounded-xl border p-3 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    adjustType === 'in'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>Nhập thêm kho (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('out')}
                  className={`rounded-xl border p-3 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    adjustType === 'out'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span>Xuất giảm kho (-)</span>
                </button>
              </div>

              {/* QUANTITY */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">
                  Số lượng {adjustType === 'in' ? 'nhập thêm' : 'xuất giảm'} *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-semibold focus:border-luxury-gold focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Dự kiến tồn kho sau điều chỉnh:{' '}
                  <span className="font-bold text-slate-800">
                    {adjustType === 'in'
                      ? selectedProduct.quantity + (Number(adjustQty) || 0)
                      : Math.max(0, selectedProduct.quantity - (Number(adjustQty) || 0))}{' '}
                    cái
                  </span>
                </p>
              </div>

              {/* REASON */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Lý do điều chỉnh</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold focus:border-luxury-gold focus:outline-none"
                >
                  <option value="Nhập hàng bổ sung">Nhập hàng bổ sung</option>
                  <option value="Kiểm kê kho sai lệch">Kiểm kê kho sai lệch</option>
                  <option value="Hàng lỗi / Hư hỏng">Hàng lỗi / Hư hỏng</option>
                  <option value="Trả lại nhà cung cấp">Trả lại nhà cung cấp</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* NOTE */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Ghi chú bổ sung</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú chi tiết cho kế toán hoặc quản lý kho..."
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingAdjust}
                  className="btn-gold px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  {savingAdjust && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Xác nhận điều chỉnh</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH IMPORT / UPLOAD EXCEL / CSV */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-scaleIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Nhập Kho Hàng Loạt Qua File Excel / CSV</span>
              </h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBatchImportSubmit} className="space-y-4">
              {/* MODE SELECTOR */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Hình thức cập nhật:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode('adjust_in')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      uploadMode === 'adjust_in'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    + Cộng thêm vào kho
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('adjust_out')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      uploadMode === 'adjust_out'
                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    - Trừ bớt tồn kho
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('set_exact')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      uploadMode === 'set_exact'
                        ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold-dark'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    = Đặt số lượng mới
                  </button>
                </div>
              </div>

              {/* REASON */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-700">Lý do nhập kho:</label>
                <input
                  type="text"
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs font-medium focus:border-luxury-gold focus:outline-none"
                  placeholder="Ví dụ: Nhập hàng lô tháng 10, kiểm kho đợt 1..."
                />
              </div>

              {/* UPLOAD FILE OR PASTE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold uppercase text-slate-700">Tải lên file hoặc dán dữ liệu:</label>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCSV}
                    className="text-luxury-gold hover:underline font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file mẫu CSV</span>
                  </button>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-luxury-gold rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-50/80"
                >
                  <Upload className="w-8 h-8 text-luxury-gold mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-800">
                    Nhấp để chọn file .csv hoặc .txt từ máy tính
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Định dạng cột: <span className="font-mono font-bold text-slate-600">SKU, Số lượng</span>
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">Hoặc dán trực tiếp danh sách vào đây:</label>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => {
                      setRawText(e.target.value);
                      const parsed = parseBatchText(e.target.value);
                      setParsedRows(parsed);
                    }}
                    placeholder={`AO-SM-001,50\nQUAN-JEAN-002,30\nVAY-HOA-003,20`}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* PREVIEW PARSED ROWS */}
              {parsedRows.length > 0 && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Đã nhận diện {parsedRows.length} sản phẩm:</span>
                    <span className="text-[10px] font-normal text-emerald-700">Sẵn sàng nhập</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 text-[11px]">
                    {parsedRows.slice(0, 10).map((r, i) => (
                      <div key={i} className="flex justify-between font-mono text-emerald-800">
                        <span>{r.sku}</span>
                        <span className="font-bold">
                          {uploadMode === 'adjust_in' ? `+${r.quantity}` : uploadMode === 'adjust_out' ? `-${r.quantity}` : `=${r.quantity}`} cái
                        </span>
                      </div>
                    ))}
                    {parsedRows.length > 10 && (
                      <p className="text-[10px] text-emerald-600 italic">
                        ... và {parsedRows.length - 10} sản phẩm khác
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* FOOTER BUTTONS */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={importingBatch}
                  className="btn-gold px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  {importingBatch && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Xác nhận nạp vào kho hàng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
