'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Search,
  X,
  CreditCard,
  User,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number | string;
  rentalPricePerDay: number | string | null;
  rentalDepositFee: number | string | null;
  rentalTerms: string | null;
  shortDescription?: string;
  images: { id: string; url: string; alt?: string; isPrimary?: boolean }[];
  categories?: { category: { id: string; name: string; slug: string } }[];
  variants?: { id: string; size?: string; color?: string }[];
}

export default function ThueDoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sizeSelected, setSizeSelected] = useState('M');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('BANK_TRANSFER');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Set default dates (today + 1 -> today + 3)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const returnDay = new Date(tomorrow);
    returnDay.setDate(tomorrow.getDate() + 2);

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    setStartDate(fmt(tomorrow));
    setEndDate(fmt(returnDay));
  }, []);

  // Fetch rental products
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        // First try getting explicitly rentable products
        const res = await fetch('/api/rentals');
        const data = await res.json();
        
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          // If no explicitly rentable product exists yet, fetch active products as rentable showcase
          const fallbackRes = await fetch('/api/products?limit=24');
          const fallbackData = await fallbackRes.json();
          if (fallbackData.products) {
            // Add virtual rental prices if not present
            const enhanced = fallbackData.products.map((p: any) => ({
              ...p,
              rentalPricePerDay: p.rentalPricePerDay || Math.round(Number(p.price) * 0.15),
              rentalDepositFee: p.rentalDepositFee || Math.round(Number(p.price) * 0.7),
            }));
            setProducts(enhanced);
          }
        }
      } catch (err) {
        console.error('Failed to load rental items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Calculate days & totals
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 1;
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const totalDays = calculateDays();
  const pricePerDay = selectedProduct
    ? Number(selectedProduct.rentalPricePerDay || selectedProduct.price)
    : 0;
  const rentalTotal = pricePerDay * totalDays;
  const depositFee = selectedProduct
    ? Number(selectedProduct.rentalDepositFee || Number(selectedProduct.price) * 0.7)
    : 0;
  const totalAmount = rentalTotal + depositFee;

  const handleOpenBooking = (prod: Product) => {
    setSelectedProduct(prod);
    setBookingSuccess(null);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      toast.error('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          idCardNumber,
          startDate,
          endDate,
          paymentMethod,
          sizeSelected,
          customerNotes,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi gửi yêu cầu thuê đồ');
      }

      setBookingSuccess(result.booking);
      toast.success('Đăng ký thuê trang phục thành công! Đội ngũ tư vấn sẽ liên hệ bạn ngay.');
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo đơn thuê');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* HERO SECTION */}
      <section className="relative bg-luxury-black text-white py-20 px-4 overflow-hidden border-b border-amber-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.18),transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-luxury-gold/40 text-luxury-gold text-xs font-semibold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Dịch Vụ Cho Thuê Trang Phục Cao Cấp
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Tỏa Sáng Sang Trọng <br />
              <span className="text-luxury-gold italic">Không Cần Sở Hữu Vĩnh Viễn</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Bộ sưu tập đầm dạ hội, Tuxedo, vest may đo và trang phục sự kiện xa xỉ dành cho những dịp đặc biệt. 
              Trải nghiệm thời trang đỉnh cao với chi phí tối ưu nhất, cam kết trang phục như mới 100%.
            </p>
          </motion.div>

          {/* 4 Steps Showcase */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-luxury-gold/20 text-luxury-gold flex items-center justify-center font-bold text-sm mb-2">
                1
              </div>
              <h4 className="text-sm font-semibold text-white">Chọn trang phục</h4>
              <p className="text-xs text-slate-400 mt-1">Lựa chọn mẫu váy áo và kích cỡ chuẩn dáng</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-luxury-gold/20 text-luxury-gold flex items-center justify-center font-bold text-sm mb-2">
                2
              </div>
              <h4 className="text-sm font-semibold text-white">Đặt lịch & Cọc</h4>
              <p className="text-xs text-slate-400 mt-1">Chọn ngày nhận - trả đồ & cọc giữ đồ nhanh chóng</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-luxury-gold/20 text-luxury-gold flex items-center justify-center font-bold text-sm mb-2">
                3
              </div>
              <h4 className="text-sm font-semibold text-white">Nhận đồ thơm tho</h4>
              <p className="text-xs text-slate-400 mt-1">Đã giặt hấp cao cấp, ủi phẳng, đóng hộp cẩn thận</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-luxury-gold/20 text-luxury-gold flex items-center justify-center font-bold text-sm mb-2">
                4
              </div>
              <h4 className="text-sm font-semibold text-white">Hoàn 100% cọc</h4>
              <p className="text-xs text-slate-400 mt-1">Gửi trả đồ và nhận lại đủ tiền cọc ngay trong ngày</p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h2 className="font-serif text-2xl font-bold text-luxury-black">
              Bộ Sưu Tập Trang Phục Cho Thuê
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hiển thị {filteredProducts.length} mẫu trang phục cao cấp sẵn sàng phục vụ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm trang phục, mã số..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold w-64 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
                <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center my-12 border border-gray-100 shadow-sm max-w-lg mx-auto">
            <Calendar className="w-12 h-12 text-luxury-gold mx-auto mb-4 opacity-70" />
            <h3 className="font-serif text-lg font-bold text-luxury-black">
              Chưa tìm thấy mẫu trang phục phù hợp
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc liên hệ hotline để được phục vụ mẫu riêng.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map((prod) => {
              const mainImg = prod.images?.[0]?.url || '/placeholder.jpg';
              const rentPrice = prod.rentalPricePerDay
                ? Number(prod.rentalPricePerDay)
                : Math.round(Number(prod.price) * 0.15);
              const deposit = prod.rentalDepositFee
                ? Number(prod.rentalDepositFee)
                : Math.round(Number(prod.price) * 0.7);

              return (
                <div
                  key={prod.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                    <Image
                      src={mainImg}
                      alt={prod.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="badge-gold text-[11px] shadow-sm">
                        Thuê đồ
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Mã: {prod.sku}
                      </div>
                      <Link
                        href={`/san-pham/${prod.slug}`}
                        className="font-medium text-sm text-luxury-black hover:text-luxury-gold line-clamp-2 mt-1 transition-colors"
                      >
                        {prod.name}
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-[11px] text-slate-400">Giá thuê:</div>
                          <div className="font-bold text-base text-rose-600">
                            {formatCurrency(rentPrice)}
                            <span className="text-xs font-normal text-slate-500">/ngày</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400">Tiền cọc:</div>
                          <div className="text-xs font-semibold text-slate-700">
                            {formatCurrency(deposit)}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenBooking(prod)}
                        className="mt-3.5 w-full btn-gold py-2.5 px-3 text-xs font-bold rounded-xl justify-center shadow-md flex items-center gap-1.5 hover:shadow-lg transition-all"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Đặt thuê ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* POLICY & GUARANTEE SECTION */}
        <div className="mt-20 bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-serif text-2xl font-bold text-luxury-black">
              Chính Sách & Quy Định Thuê Trang Phục
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Minh bạch, bảo đảm quyền lợi đôi bên và chất lượng trang phục luôn hoàn hảo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-luxury-gold flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-luxury-black">Đặt cọc & Hoàn tiền</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Tiền cọc sẽ được hoàn trả 100% ngay sau khi shop nhận lại trang phục và kiểm tra tình trạng nguyên vẹn, không rách hỏng lớn.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-luxury-gold flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-luxury-black">Giặt là & Bảo dưỡng</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Quý khách không cần tự giặt trang phục khi trả. Đội ngũ chuyên nghiệp của chúng tôi sẽ xử lý giặt khô hấp tiêu chuẩn hoàng gia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-luxury-gold flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-luxury-black">Giao nhận tận nơi</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Hỗ trợ giao hỏa tốc nội thành hoặc ship COD toàn quốc. Được kiểm tra hàng trước khi nhận và thử trang phục thoải mái.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RENTAL BOOKING MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative border border-gray-100"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {bookingSuccess ? (
                /* SUCCESS VIEW */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-luxury-black">
                    Đặt Thuê Thành Công!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Mã đơn thuê của bạn là{' '}
                    <span className="font-mono font-bold text-luxury-gold">
                      {bookingSuccess.bookingNumber}
                    </span>
                    . Chuyên viên chăm sóc khách hàng của chúng tôi sẽ gọi điện xác nhận trong vòng 15 phút.
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-2.5 max-w-md mx-auto border border-gray-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trang phục:</span>
                      <span className="font-semibold text-slate-800">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thời gian thuê:</span>
                      <span className="font-semibold text-slate-800">
                        {startDate} đến {endDate} ({bookingSuccess.totalDays} ngày)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền thuê ({bookingSuccess.totalDays} ngày):</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(bookingSuccess.rentalTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền cọc (hoàn lại):</span>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(bookingSuccess.depositFee)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                      <span>Tổng thanh toán tạm tính:</span>
                      <span className="text-rose-600">{formatCurrency(bookingSuccess.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn-gold px-6 py-2.5 text-xs font-bold rounded-xl"
                    >
                      Đóng cửa sổ
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM VIEW */
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
                      Đăng Ký Thuê Đồ
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-luxury-black mt-1">
                      {selectedProduct.name}
                    </h3>
                  </div>

                  {/* Product Summary Preview */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100">
                    <div className="relative w-16 h-20 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={selectedProduct.images?.[0]?.url || '/placeholder.jpg'}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-slate-800">{selectedProduct.name}</div>
                      <div className="text-slate-400 mt-0.5">Mã: {selectedProduct.sku}</div>
                      <div className="flex items-center gap-3 mt-2 font-semibold">
                        <span className="text-rose-600">
                          {formatCurrency(pricePerDay)}/ngày
                        </span>
                        <span className="text-slate-500">
                          Cọc: {formatCurrency(depositFee)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rental Schedule Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Ngày nhận trang phục *
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Ngày trả trang phục *
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                      />
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Kích cỡ (Size) *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'Freesize'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSizeSelected(sz)}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                            sizeSelected === sz
                              ? 'bg-luxury-black text-white border-luxury-black shadow-sm'
                              : 'bg-white text-slate-700 border-gray-200 hover:border-luxury-gold'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Thông Tin Nhận Đồ & Liên Hệ
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Họ và tên người thuê *
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Nguyễn Thị Lan"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          placeholder="0912 345 678"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email (để nhận biên lai điện tử)
                        </label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Số CCCD/CMND (bảo đảm cọc)
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập số CCCD (tùy chọn)"
                          value={idCardNumber}
                          onChange={(e) => setIdCardNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Địa chỉ nhận trang phục *
                      </label>
                      <input
                        type="text"
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ghi chú thêm (chiều cao, cân nặng, yêu cầu là phẳng...)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ví dụ: Cao 1m62 nặng 48kg, cần giao trước 10h sáng"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Hình thức thanh toán cọc & tiền thuê
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('BANK_TRANSFER')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          paymentMethod === 'BANK_TRANSFER'
                            ? 'border-luxury-gold bg-amber-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-slate-800">Chuyển khoản (Ưu tiên)</div>
                          <div className="text-[10px] text-slate-500">Giữ lịch thuê ngay lập tức</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          paymentMethod === 'COD'
                            ? 'border-luxury-gold bg-amber-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Truck className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-slate-800">Cọc COD khi nhận đồ</div>
                          <div className="text-[10px] text-slate-500">Thanh toán cho shipper</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Tiền thuê ({totalDays} ngày x {formatCurrency(pricePerDay)}):
                      </span>
                      <span className="font-semibold text-slate-800">{formatCurrency(rentalTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền cọc đảm bảo (hoàn lại 100%):</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(depositFee)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                      <span className="text-luxury-black">Tổng thanh toán tạm tính:</span>
                      <span className="text-rose-600">{formatCurrency(totalAmount)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      * Tiền cọc sẽ được hoàn lại nguyên vẹn vào tài khoản ngân hàng của bạn ngay khi shop nhận lại đồ.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-gold px-8 py-3 text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>Xác nhận đặt thuê</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
