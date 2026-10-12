'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shirt,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  User,
  MapPin,
  FileText,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  X,
  ExternalLink,
  Plus,
  Upload,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Booking {
  id: string;
  bookingNumber: string;
  userId: string | null;
  productId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  idCardNumber: string | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number | string;
  rentalTotal: number | string;
  depositFee: number | string;
  totalAmount: number | string;
  refundedDeposit: number | string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  sizeSelected: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  itemConditionNotes: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    slug: string;
    images?: { url: string }[];
  };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number | string;
  isRentable: boolean;
  rentalPricePerDay: number | string | null;
  rentalDepositFee: number | string | null;
  rentalTerms: string | null;
  images?: { url: string }[];
}

export default function AdminThueDoPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'products' | 'policy'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal Detail & Update
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editRefundedDeposit, setEditRefundedDeposit] = useState<number>(0);
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editItemCondition, setEditItemCondition] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Tab 2: Products list
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Tab 2: Add / Upload new rentable product modal
  const [isAddRentalOpen, setIsAddRentalOpen] = useState(false);
  const [newRentalName, setNewRentalName] = useState('');
  const [newRentalSku, setNewRentalSku] = useState('');
  const [newRentalPricePerDay, setNewRentalPricePerDay] = useState('');
  const [newRentalDepositFee, setNewRentalDepositFee] = useState('');
  const [newRentalPrice, setNewRentalPrice] = useState('');
  const [newRentalQuantity, setNewRentalQuantity] = useState('5');
  const [newRentalSizes, setNewRentalSizes] = useState<string[]>(['S', 'M', 'L']);
  const [newRentalTerms, setNewRentalTerms] = useState('');
  const [newRentalImages, setNewRentalImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingNewRental, setSavingNewRental] = useState(false);
  const rentalFileInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: Rental Policies
  const [rentalTermsText, setRentalTermsText] = useState(
    '1. Khách hàng bảo quản trang phục cẩn thận, không tự ý cắt sửa hoặc giặt tẩy hóa chất mạnh.\n2. Tiền cọc sẽ được hoàn lại 100% khi shop nhận lại trang phục nguyên vẹn.\n3. Trường hợp rách hỏng không thể phục hồi: đền bù theo 70% giá trị gốc của sản phẩm.\n4. Thời gian trả trễ: tính thêm phí theo đơn giá thuê mỗi ngày.'
  );
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Load Bookings
  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/admin/rentals?${params.toString()}`);
      if (!res.ok) throw new Error('Không thể tải danh sách đơn thuê đồ');
      const data = await res.json();
      setBookings(data.bookings || []);
      setStats(data.stats || {});
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải đơn thuê đồ');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookings();
    }
  }, [activeTab, statusFilter, searchQuery]);

  // Load Products for Tab 2
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/admin/products?limit=100');
      if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    }
  }, [activeTab]);

  // Load Store Settings for Tab 3 Policy
  useEffect(() => {
    if (activeTab === 'policy') {
      fetch('/api/admin/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings?.rental_policy_terms) {
            setRentalTermsText(data.settings.rental_policy_terms);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  // Open booking detail modal
  const handleOpenDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditPaymentStatus(booking.paymentStatus);
    setEditRefundedDeposit(Number(booking.refundedDeposit || 0));
    setEditAdminNotes(booking.adminNotes || '');
    setEditItemCondition(booking.itemConditionNotes || '');
  };

  // Submit booking update
  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/rentals/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          paymentStatus: editPaymentStatus,
          refundedDeposit: editRefundedDeposit,
          adminNotes: editAdminNotes,
          itemConditionNotes: editItemCondition,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');

      toast.success('Đã cập nhật đơn thuê đồ thành công');
      setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật đơn');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn thuê đồ này?')) return;
    try {
      const res = await fetch(`/api/admin/rentals/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');
      toast.success('Đã xóa đơn thuê đồ thành công');
      if (selectedBooking?.id === id) setSelectedBooking(null);
      loadBookings();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa đơn');
    }
  };

  // Toggle isRentable for Product in Tab 2
  const handleToggleRentable = async (prod: Product) => {
    try {
      const newStatus = !prod.isRentable;
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isRentable: newStatus,
          rentalPricePerDay: prod.rentalPricePerDay || Math.round(Number(prod.price) * 0.15),
          rentalDepositFee: prod.rentalDepositFee || Math.round(Number(prod.price) * 0.7),
        }),
      });

      if (!res.ok) throw new Error('Không thể cập nhật trạng thái thuê');
      toast.success(newStatus ? 'Đã bật chế độ cho thuê' : 'Đã tắt chế độ cho thuê');
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, isRentable: newStatus } : p))
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật');
    }
  };

  // Update quick rental price for Product in Tab 2
  const handleUpdateRentalPrice = async (prod: Product, rentPrice: number, depPrice: number) => {
    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isRentable: true,
          rentalPricePerDay: rentPrice,
          rentalDepositFee: depPrice,
        }),
      });

      if (!res.ok) throw new Error('Không thể lưu giá thuê');
      toast.success('Đã lưu giá thuê & tiền cọc thành công');
      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id
            ? { ...p, isRentable: true, rentalPricePerDay: rentPrice, rentalDepositFee: depPrice }
            : p
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu giá thuê');
    }
  };

  // Upload image for new rental product
  const handleUploadRentalImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi tải ảnh lên');
      setNewRentalImages((prev) => [...prev, data.url]);
      toast.success('Đã tải ảnh lên thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải ảnh');
    } finally {
      setUploadingImage(false);
      if (rentalFileInputRef.current) rentalFileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setNewRentalImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveRentalImage = (idx: number) => {
    setNewRentalImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Create new rentable product
  const handleCreateRentalProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRentalName.trim() || !newRentalPricePerDay) {
      toast.error('Vui lòng nhập tên trang phục và giá thuê theo ngày!');
      return;
    }

    try {
      setSavingNewRental(true);
      const sku = newRentalSku.trim() || `THUE-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      const priceVal = Number(newRentalPrice) || Number(newRentalPricePerDay) * 7;
      const rentPriceVal = Number(newRentalPricePerDay);
      const depFeeVal = Number(newRentalDepositFee) || Math.round(priceVal * 0.7);

      const imagesToSave =
        newRentalImages.length > 0
          ? newRentalImages.map((url, idx) => ({ url, alt: newRentalName, isPrimary: idx === 0 }))
          : [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', isPrimary: true }];

      const variants = newRentalSizes.map((s) => ({
        name: `${newRentalName} - Size ${s}`,
        sku: `${sku}-${s}`,
        size: s,
        quantity: Math.max(1, Math.floor(Number(newRentalQuantity) / newRentalSizes.length)),
        isActive: true,
      }));

      const payload = {
        name: newRentalName.trim(),
        sku,
        price: priceVal,
        quantity: Number(newRentalQuantity) || 5,
        isRentable: true,
        rentalPricePerDay: rentPriceVal,
        rentalDepositFee: depFeeVal,
        rentalTerms: newRentalTerms.trim() || null,
        description: `Trang phục cho thuê cao cấp: ${newRentalName.trim()}.\nĐã giặt hấp sạch sẽ, ủi phẳng, sẵn sàng phục vụ sự kiện, tiệc cưới, dạ hội, chụp ảnh nghệ thuật.`,
        images: imagesToSave,
        variants,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi đăng trang phục');

      toast.success('Đã đăng trang phục cho thuê thành công!');
      setIsAddRentalOpen(false);
      setNewRentalName('');
      setNewRentalSku('');
      setNewRentalPricePerDay('');
      setNewRentalDepositFee('');
      setNewRentalPrice('');
      setNewRentalTerms('');
      setNewRentalImages([]);
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo đồ cho thuê');
    } finally {
      setSavingNewRental(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa sản phẩm');
      toast.success('Đã xóa sản phẩm thành công');
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xóa sản phẩm');
    }
  };

  // Save Policy
  const handleSavePolicy = async () => {
    try {
      setSavingPolicy(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            rental_policy_terms: rentalTermsText,
          },
        }),
      });
      if (!res.ok) throw new Error('Không thể lưu quy định thuê');
      toast.success('Đã lưu quy định & điều khoản thuê đồ thành công');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu');
    } finally {
      setSavingPolicy(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Chờ duyệt</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Đã cọc & Xác nhận</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Đang giao đồ</span>;
      case 'RENTING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Khách đang thuê</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Đã trả đồ - Chờ duyệt cọc</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Hoàn tất</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-luxury-black flex items-center gap-2.5">
            <Shirt className="w-7 h-7 text-luxury-gold" />
            <span>Quản Lý Thuê Đồ & Trang Phục</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý toàn diện dịch vụ cho thuê trang phục, duyệt đơn đặt cọc, theo dõi lịch trả đồ và cấu hình đồ cho thuê
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/thue-do"
            target="_blank"
            className="btn-outline text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem trang Thuê đồ</span>
          </Link>
          <button
            onClick={() => loadBookings()}
            className="btn-gold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* KPI STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">Tổng đơn thuê</div>
          <div className="text-xl font-bold text-luxury-black mt-1">
            {stats.totalBookings || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-sm">
          <div className="text-xs text-amber-600 font-medium">Chờ duyệt</div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {stats.pendingCount || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-100 bg-purple-50/20 shadow-sm">
          <div className="text-xs text-purple-600 font-medium">Đang thuê</div>
          <div className="text-xl font-bold text-purple-700 mt-1">
            {stats.rentingCount || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-yellow-100 bg-yellow-50/20 shadow-sm">
          <div className="text-xs text-yellow-600 font-medium">Đã trả chờ hoàn cọc</div>
          <div className="text-xl font-bold text-yellow-700 mt-1">
            {stats.returnedCount || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <div className="text-xs text-emerald-600 font-medium">Tiền thuê tích lũy</div>
          <div className="text-base font-bold text-emerald-700 mt-1">
            {formatCurrency(stats.totalRentalRevenue || 0)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-100 bg-blue-50/20 shadow-sm">
          <div className="text-xs text-blue-600 font-medium">Cọc đang giữ</div>
          <div className="text-base font-bold text-blue-700 mt-1">
            {formatCurrency(stats.totalDepositHeld || 0)}
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-luxury-gold text-luxury-gold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Đơn Thuê Đồ ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-luxury-gold text-luxury-gold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Đồ Cho Thuê & Bảng Giá
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`pb-3 px-6 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'policy'
              ? 'border-luxury-gold text-luxury-gold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quy Định & Chính Sách Thuê
        </button>
      </div>

      {/* TAB 1: RENTAL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên, SĐT, trang phục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-500 whitespace-nowrap font-medium">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-gray-200 rounded-xl text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="CONFIRMED">Đã cọc & Xác nhận</option>
                <option value="SHIPPING">Đang giao đồ</option>
                <option value="RENTING">Đang thuê</option>
                <option value="RETURNED">Đã trả đồ - Chờ hoàn cọc</option>
                <option value="COMPLETED">Hoàn tất</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loadingBookings ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Đang tải dữ liệu đơn thuê đồ...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Shirt className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">Chưa có đơn thuê đồ nào</p>
                <p className="text-xs text-slate-400 mt-1">
                  Đơn thuê của khách hàng từ website sẽ xuất hiện tại đây
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-4">Mã đơn & Ngày tạo</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Trang phục</th>
                      <th className="p-4">Lịch thuê</th>
                      <th className="p-4">Tài chính</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-800">
                          <div>{b.bookingNumber}</div>
                          <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                            {formatDate(b.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{b.customerName}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">{b.customerPhone}</div>
                          {b.idCardNumber && (
                            <div className="text-[10px] text-slate-400">CCCD: {b.idCardNumber}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-10 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={b.product.images?.[0]?.url || '/placeholder.jpg'}
                                alt={b.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 line-clamp-1">
                                {b.product.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Size: {b.sizeSelected || 'M'} | SKU: {b.product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-800 font-medium">
                            {formatDate(b.startDate)} → {formatDate(b.endDate)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Tổng: {b.totalDays} ngày thuê
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-rose-600 font-bold">
                            Thuê: {formatCurrency(b.rentalTotal)}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Cọc: {formatCurrency(b.depositFee)}
                          </div>
                          {Number(b.refundedDeposit) > 0 && (
                            <div className="text-emerald-600 text-[10px]">
                              Đã hoàn cọc: {formatCurrency(b.refundedDeposit)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">{getStatusBadge(b.status)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetail(b)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-luxury-gold rounded-lg transition-colors"
                              title="Xem & Cập nhật đơn"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                              title="Xóa đơn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RENTABLE PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddRentalOpen(true)}
                className="btn-gold text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Đăng Đồ Cho Thuê Mới</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loadingProducts ? (
              <div className="p-12 text-center text-slate-400">Đang tải danh sách sản phẩm...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                    <tr>
                      <th className="p-4">Sản phẩm</th>
                      <th className="p-4">Giá bán gốc</th>
                      <th className="p-4">Bật/Tắt thuê</th>
                      <th className="p-4">Giá thuê / ngày (VNĐ)</th>
                      <th className="p-4">Tiền cọc đảm bảo (VNĐ)</th>
                      <th className="p-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products
                      .filter((p) =>
                        !productSearch ||
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.sku.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                <Image
                                  src={prod.images?.[0]?.url || '/placeholder.jpg'}
                                  alt={prod.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 line-clamp-1">
                                  {prod.name}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  Mã SKU: {prod.sku}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-700">
                            {formatCurrency(prod.price)}
                          </td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleToggleRentable(prod)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                prod.isRentable
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {prod.isRentable ? 'ĐANG BẬT THUÊ' : 'TẮT'}
                            </button>
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              defaultValue={
                                prod.rentalPricePerDay
                                  ? Number(prod.rentalPricePerDay)
                                  : Math.round(Number(prod.price) * 0.15)
                              }
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                const dep = prod.rentalDepositFee
                                  ? Number(prod.rentalDepositFee)
                                  : Math.round(Number(prod.price) * 0.7);
                                handleUpdateRentalPrice(prod, val, dep);
                              }}
                              className="w-32 px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              defaultValue={
                                prod.rentalDepositFee
                                  ? Number(prod.rentalDepositFee)
                                  : Math.round(Number(prod.price) * 0.7)
                              }
                              onBlur={(e) => {
                                const dep = Number(e.target.value);
                                const val = prod.rentalPricePerDay
                                  ? Number(prod.rentalPricePerDay)
                                  : Math.round(Number(prod.price) * 0.15);
                                handleUpdateRentalPrice(prod, val, dep);
                              }}
                              className="w-32 px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                            />
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/san-pham/${prod.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-luxury-gold bg-luxury-gold/10 hover:bg-luxury-gold/20 rounded-lg font-semibold transition-colors"
                                title="Sửa chi tiết"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Sửa</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: POLICIES & TERMS */}
      {activeTab === 'policy' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-4xl space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-luxury-black">
              Chính Sách & Quy Định Thuê Đồ
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Nội dung này hiển thị công khai trên website cho khách hàng khi đăng ký thuê đồ
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Điều khoản, cam kết giữ gìn trang phục & chính sách hoàn cọc:
            </label>
            <textarea
              rows={8}
              value={rentalTermsText}
              onChange={(e) => setRentalTermsText(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-gray-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSavePolicy}
              disabled={savingPolicy}
              className="btn-gold px-6 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              {savingPolicy ? 'Đang lưu...' : 'Lưu quy định thuê đồ'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL & STATUS UPDATE */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleUpdateBooking} className="space-y-6">
              <div>
                <span className="text-xs font-bold text-luxury-gold uppercase tracking-wider">
                  Chi Tiết Đơn Thuê Đồ
                </span>
                <h3 className="font-serif text-2xl font-bold text-luxury-black mt-1">
                  {selectedBooking.bookingNumber}
                </h3>
              </div>

              {/* Customer Info Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                <div className="font-bold text-slate-800 text-sm mb-1">Thông tin khách hàng:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400">Họ tên:</span>{' '}
                    <span className="font-semibold text-slate-700">{selectedBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Số điện thoại:</span>{' '}
                    <a
                      href={`tel:${selectedBooking.customerPhone}`}
                      className="font-semibold text-luxury-gold hover:underline"
                    >
                      {selectedBooking.customerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400">CCCD:</span>{' '}
                    <span className="font-mono">{selectedBooking.idCardNumber || 'Chưa cung cấp'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>{' '}
                    <span>{selectedBooking.customerEmail || 'Không có'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Địa chỉ giao đồ:</span>{' '}
                  <span className="font-medium text-slate-700">{selectedBooking.shippingAddress}</span>
                </div>
                {selectedBooking.customerNotes && (
                  <div className="pt-1 text-slate-600 italic">
                    Ghi chú của khách: &ldquo;{selectedBooking.customerNotes}&rdquo;
                  </div>
                )}
              </div>

              {/* Product & Schedule */}
              <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-gray-100 text-xs">
                <div className="relative w-16 h-20 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={selectedBooking.product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={selectedBooking.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-800">
                    {selectedBooking.product.name}
                  </div>
                  <div className="text-slate-400">
                    Size: {selectedBooking.sizeSelected || 'M'} | SKU: {selectedBooking.product.sku}
                  </div>
                  <div className="font-medium text-slate-700">
                    Thời gian: {formatDate(selectedBooking.startDate)} →{' '}
                    {formatDate(selectedBooking.endDate)} ({selectedBooking.totalDays} ngày)
                  </div>
                  <div className="font-bold text-rose-600">
                    Tổng tiền thuê: {formatCurrency(selectedBooking.rentalTotal)} | Tiền cọc: {formatCurrency(selectedBooking.depositFee)}
                  </div>
                </div>
              </div>

              {/* Status Update Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Trạng thái đơn thuê:
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
                  >
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="CONFIRMED">Đã cọc & Xác nhận</option>
                    <option value="SHIPPING">Đang giao đồ cho khách</option>
                    <option value="RENTING">Khách đang thuê</option>
                    <option value="RETURNED">Đã nhận lại đồ - Chờ duyệt hoàn cọc</option>
                    <option value="COMPLETED">Hoàn tất đơn & Đã hoàn cọc</option>
                    <option value="CANCELLED">Hủy đơn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Trạng thái thanh toán:
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
                  >
                    <option value="PENDING">Chưa thanh toán</option>
                    <option value="DEPOSITED">Đã nhận tiền cọc</option>
                    <option value="PAID">Đã thanh toán đủ (thuê + cọc)</option>
                    <option value="REFUNDED">Đã hoàn trả tiền cọc cho khách</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số tiền cọc đã hoàn trả (VNĐ):
                </label>
                <input
                  type="number"
                  value={editRefundedDeposit}
                  onChange={(e) => setEditRefundedDeposit(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tình trạng trang phục khi nhận lại:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đồ nguyên vẹn, sạch sẽ / Có vết bẩn nhẹ cần giặt tẩy riêng / Hỏng cúc..."
                  value={editItemCondition}
                  onChange={(e) => setEditItemCondition(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ghi chú nội bộ admin:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm của nhân viên..."
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa đơn này</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-gold px-6 py-2 text-xs font-bold rounded-xl shadow-md"
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu cập nhật'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ĐĂNG TẢI TRANG PHỤC CHO THUÊ MỚI */}
      {isAddRentalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-gray-100 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsAddRentalOpen(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateRentalProduct} className="space-y-5">
              <div>
                <span className="text-xs font-bold text-luxury-gold uppercase tracking-wider">
                  Thêm mới vào danh mục cho thuê
                </span>
                <h3 className="font-serif text-2xl font-bold text-luxury-black mt-1">
                  Đăng Tải Trang Phục Cho Thuê Mới
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sản phẩm sẽ tự động hiển thị trong trang Cho Thuê Đồ và cho phép khách hàng đặt lịch thuê trực tuyến.
                </p>
              </div>

              {/* Tên & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên trang phục <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Đầm Dạ Hội Kim Sa Hoàng Gia YIFU"
                    value={newRentalName}
                    onChange={(e) => setNewRentalName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mã SKU (tự sinh nếu để trống):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: THUE-DH01"
                    value={newRentalSku}
                    onChange={(e) => setNewRentalSku(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                  />
                </div>
              </div>

              {/* Upload ảnh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hình ảnh trang phục (Tải từ máy tính hoặc nhập Link):
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <input
                    type="file"
                    ref={rentalFileInputRef}
                    onChange={handleUploadRentalImage}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => rentalFileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-luxury-gold" />
                    <span>{uploadingImage ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy tính'}</span>
                  </button>

                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <input
                      type="url"
                      placeholder="Hoặc dán URL ảnh (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 p-2 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-black"
                    >
                      Thêm URL
                    </button>
                  </div>
                </div>

                {/* Danh sách ảnh đã upload */}
                {newRentalImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-2xl border border-gray-100">
                    {newRentalImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-20 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-xs group">
                        <Image src={imgUrl} alt={`Ảnh ${idx + 1}`} fill className="object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 right-1 bg-luxury-gold text-white text-[9px] font-bold py-0.5 text-center rounded">
                            Ảnh chính
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveRentalImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Giá thuê, Tiền cọc, Giá bán gốc */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Giá thuê / ngày (VNĐ) <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="VD: 350000"
                    value={newRentalPricePerDay}
                    onChange={(e) => setNewRentalPricePerDay(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tiền cọc đảm bảo (VNĐ):
                  </label>
                  <input
                    type="number"
                    placeholder="Mặc định: 70% giá trị đồ"
                    value={newRentalDepositFee}
                    onChange={(e) => setNewRentalDepositFee(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Giá trị gốc trang phục (VNĐ):
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 2500000"
                    value={newRentalPrice}
                    onChange={(e) => setNewRentalPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                  />
                </div>
              </div>

              {/* Số lượng và Chọn Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số lượng trong kho cho thuê:
                  </label>
                  <input
                    type="number"
                    value={newRentalQuantity}
                    onChange={(e) => setNewRentalQuantity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Các kích cỡ có sẵn:
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Freesize'].map((sz) => {
                      const isSelected = newRentalSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewRentalSizes((prev) => prev.filter((s) => s !== sz));
                            } else {
                              setNewRentalSizes((prev) => [...prev, sz]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-luxury-gold text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Điều khoản riêng */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Quy định & Lưu ý bảo quản riêng cho trang phục này (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Trang phục có đính đá pha lê thủ công, chỉ giặt khô, không là nhiệt độ cao..."
                  value={newRentalTerms}
                  onChange={(e) => setNewRentalTerms(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-luxury-gold/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddRentalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingNewRental}
                  className="btn-gold px-6 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  {savingNewRental ? 'Đang tạo sản phẩm...' : 'Đăng tải trang phục cho thuê'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
