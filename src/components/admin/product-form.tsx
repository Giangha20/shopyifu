'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtPrice ? String(initialData.compareAtPrice) : ''
  );
  const [costPrice, setCostPrice] = useState(
    initialData?.costPrice ? String(initialData.costPrice) : ''
  );
  const [quantity, setQuantity] = useState(
    initialData?.quantity !== undefined ? String(initialData.quantity) : '10'
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialData?.lowStockThreshold !== undefined ? String(initialData.lowStockThreshold) : '5'
  );
  const [brand, setBrand] = useState(initialData?.brand || 'LUXE');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categoryIds ||
      initialData?.categories?.map((c: any) => c.categoryId || c.id) ||
      []
  );

  // Status flags
  const [isActive, setIsActive] = useState(
    initialData?.isActive !== undefined ? initialData.isActive : true
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [isNew, setIsNew] = useState(Boolean(initialData?.isNew));
  const [isBestseller, setIsBestseller] = useState(Boolean(initialData?.isBestseller));

  // Rental states
  const [isRentable, setIsRentable] = useState(Boolean(initialData?.isRentable));
  const [rentalPricePerDay, setRentalPricePerDay] = useState(
    initialData?.rentalPricePerDay ? String(initialData.rentalPricePerDay) : ''
  );
  const [rentalDepositFee, setRentalDepositFee] = useState(
    initialData?.rentalDepositFee ? String(initialData.rentalDepositFee) : ''
  );
  const [rentalTerms, setRentalTerms] = useState(initialData?.rentalTerms || '');

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');

  // Images list
  const [images, setImages] = useState<{ url: string; alt?: string; isPrimary: boolean }[]>(
    initialData?.images?.map((img: any) => ({
      url: img.url,
      alt: img.alt || '',
      isPrimary: Boolean(img.isPrimary),
    })) || [
      {
        url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800',
        alt: 'Hình ảnh chính',
        isPrimary: true,
      },
    ]
  );
  // Variants
  const [variants, setVariants] = useState<any[]>(
    initialData?.variants || [
      { name: 'Đen - S', sku: `${sku || 'LX'}-BLK-S`, price: '', quantity: 5, color: 'Đen', size: 'S' },
      { name: 'Đen - M', sku: `${sku || 'LX'}-BLK-M`, price: '', quantity: 5, color: 'Đen', size: 'M' },
    ]
  );

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Tải ảnh lên thất bại');
        return;
      }

      setImages((prev) => [
        ...prev,
        {
          url: data.url,
          alt: name || 'Ảnh sản phẩm',
          isPrimary: prev.length === 0,
        },
      ]);
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi tải ảnh lên');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) {
      fileInputRef.current?.click();
      return;
    }
    setImages([
      ...images,
      {
        url: imageUrlInput.trim(),
        alt: name,
        isPrimary: images.length === 0,
      },
    ]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    if (updated.length > 0 && !updated.some((i) => i.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const handleSetPrimary = (index: number) => {
    setImages(
      images.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: 'Mới',
        sku: `${sku || 'LX'}-${variants.length + 1}`,
        price: price || 0,
        quantity: 1,
        color: '',
        size: '',
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price) {
      alert('Vui lòng điền đầy đủ tên sản phẩm, mã SKU và giá bán.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        shortDescription: shortDescription?.trim() || null,
        description: description?.trim() || null,
        price: Number(price) || 0,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        costPrice: costPrice ? Number(costPrice) : null,
        quantity: Number(quantity) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        brand: brand?.trim() || 'LUXE',
        isActive,
        isFeatured,
        isNew,
        isBestseller,
        isRentable,
        rentalPricePerDay: rentalPricePerDay ? Number(rentalPricePerDay) : null,
        rentalDepositFee: rentalDepositFee ? Number(rentalDepositFee) : null,
        rentalTerms: rentalTerms?.trim() || null,
        metaTitle: (metaTitle || name)?.trim().slice(0, 255) || null,
        metaDescription: (metaDescription || shortDescription)?.trim().slice(0, 500) || null,
        categoryIds: selectedCategoryIds,
        images,
        variants: variants.map((v: any, idx: number) => ({
          ...v,
          name: v.name?.trim() || `Phiên bản ${idx + 1}`,
          sku: v.sku?.trim() || `${sku.trim()}-${idx + 1}`,
          price: v.price !== '' && v.price !== null && v.price !== undefined ? Number(v.price) : null,
          quantity: Number(v.quantity) || 0,
        })),
      };

      const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        const detailMsgs = result.details
          ? typeof result.details === 'object'
            ? Object.entries(result.details)
                .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
                .join('\n')
            : String(result.details)
          : '';
        alert((result.error || 'Có lỗi xảy ra khi lưu sản phẩm') + (detailMsgs ? `\n\nChi tiết:\n${detailMsgs}` : ''));
        return;
      }

      router.push('/admin/san-pham');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/san-pham"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
              {isEdit ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEdit ? `Mã SKU: ${sku}` : 'Nhập thông tin chi tiết và định giá sản phẩm'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/san-pham">
            <Button variant="outline" type="button">Hủy bỏ</Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-luxury-black text-white hover:bg-luxury-black-light"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Cập nhật sản phẩm' : 'Đăng bán sản phẩm'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 cols: Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Basic Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Thông tin chung
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Tên sản phẩm *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Áo Blazer Dạ Tweed Cao Cấp"
                className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-700">Mã SKU *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="LX-BLAZER-01"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm font-mono focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-700">Thương hiệu</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="LUXE Couture"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Mô tả ngắn</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Tóm tắt điểm nổi bật của sản phẩm..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Mô tả chi tiết</label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chi tiết chất liệu, form dáng, cách bảo quản..."
                className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-luxury-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Giá & Tồn kho
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-700">Giá bán niêm yết (VNĐ) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500000"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-700">Giá gốc so sánh (VNĐ)</label>
                <input
                  type="number"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="2000000"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-700">Giá vốn (VNĐ)</label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="800000"
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-700">Số lượng tổng</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-700">Ngưỡng cảnh báo sắp hết</label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Dịch vụ Thuê Đồ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Dịch Vụ Cho Thuê Đồ (Trang phục cho thuê)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cấu hình cho phép khách hàng đặt thuê sản phẩm này theo ngày
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRentable}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsRentable(checked);
                    if (checked && !rentalPricePerDay && price) {
                      setRentalPricePerDay(String(Math.round(Number(price) * 0.15)));
                    }
                    if (checked && !rentalDepositFee && price) {
                      setRentalDepositFee(String(Math.round(Number(price) * 0.7)));
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                <span className="ml-2.5 text-xs font-bold text-slate-700">
                  {isRentable ? 'BẬT CHO THUÊ' : 'TẮT'}
                </span>
              </label>
            </div>

            {isRentable && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-700">
                      Giá thuê theo ngày (VNĐ) *
                    </label>
                    <input
                      type="number"
                      value={rentalPricePerDay}
                      onChange={(e) => setRentalPricePerDay(e.target.value)}
                      placeholder="Ví dụ: 300000"
                      className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">
                      Gợi ý: ~15% giá bán gốc sản phẩm
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-700">
                      Tiền cọc đảm bảo hoàn lại (VNĐ) *
                    </label>
                    <input
                      type="number"
                      value={rentalDepositFee}
                      onChange={(e) => setRentalDepositFee(e.target.value)}
                      placeholder="Ví dụ: 1500000"
                      className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-luxury-gold focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">
                      Gợi ý: ~70% giá bán gốc (hoàn lại 100% khi nhận lại đồ)
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Quy định / Điều khoản riêng cho mẫu này (Tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={rentalTerms}
                    onChange={(e) => setRentalTerms(e.target.value)}
                    placeholder="Ví dụ: Đầm tơ tằm nguyên bản cần giặt hấp nhẹ, không xịt nước hoa trực tiếp..."
                    className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Images Gallery */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Hình ảnh sản phẩm
            </h2>

            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <input
                type="text"
                placeholder="Dán URL hình ảnh (hoặc nhấn Enter để thêm)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
                className="h-10 flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleAddImage}
                disabled={isUploadingImage}
                size="sm"
                className="bg-luxury-black text-white hover:bg-slate-800"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Thêm ảnh
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                size="sm"
                className="border-slate-300 hover:border-luxury-gold"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-luxury-gold" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1.5 h-3.5 w-3.5 text-luxury-gold" />
                    Tải ảnh từ máy
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative aspect-square overflow-hidden rounded-xl border bg-slate-50 transition-all ${
                    img.isPrimary ? 'border-luxury-gold ring-2 ring-luxury-gold/30' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || 'Ảnh'}
                    className="h-full w-full object-cover"
                    onError={(e: any) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />

                  {/* Actions overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-between bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="self-end rounded-lg bg-rose-600/80 p-1 text-white hover:bg-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="w-full rounded bg-white/90 py-1 text-2xs font-semibold text-slate-900 hover:bg-white"
                    >
                      {img.isPrimary ? 'Ảnh chính' : 'Đặt làm ảnh chính'}
                    </button>
                  </div>

                  {img.isPrimary && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-luxury-gold px-1.5 py-0.5 text-2xs font-bold text-white shadow-sm">
                      Chính
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Variants */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Biến thể (Màu sắc / Size)</h2>
              <Button type="button" onClick={handleAddVariant} variant="outline" size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Thêm biến thể
              </Button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:flex-row sm:items-center"
                >
                  <input
                    type="text"
                    placeholder="Tên (VD: Đen - XL)"
                    value={v.name}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].name = e.target.value;
                      setVariants(updated);
                    }}
                    className="h-9 flex-1 rounded border border-slate-300 px-2.5 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Mã SKU"
                    value={v.sku}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].sku = e.target.value;
                      setVariants(updated);
                    }}
                    className="h-9 w-32 rounded border border-slate-300 px-2.5 text-xs font-mono focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Số lượng"
                    value={v.quantity}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].quantity = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="h-9 w-20 rounded border border-slate-300 px-2.5 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 col: Categories, Statuses, SEO */}
        <div className="space-y-6">
          {/* Status & Highlights */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Trạng thái & Phân loại
            </h2>

            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded text-luxury-gold focus:ring-luxury-gold/30"
                />
                <span className="font-medium text-slate-900">Hiển thị (Đang bán)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded text-luxury-gold focus:ring-luxury-gold/30"
                />
                <span className="text-slate-700">Sản phẩm Nổi bật (Featured)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="h-4 w-4 rounded text-luxury-gold focus:ring-luxury-gold/30"
                />
                <span className="text-slate-700">Hàng mới về (New Arrival)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="h-4 w-4 rounded text-luxury-gold focus:ring-luxury-gold/30"
                />
                <span className="text-slate-700">Sản phẩm Bán chạy (Bestseller)</span>
              </label>
            </div>
          </div>

          {/* Categories Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Danh mục sản phẩm
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {categories.map((cat) => {
                const checked = selectedCategoryIds.includes(cat.id);
                return (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                        } else {
                          setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== cat.id));
                        }
                      }}
                      className="h-4 w-4 rounded text-luxury-gold focus:ring-luxury-gold/30"
                    />
                    <span className="text-slate-800">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tối ưu SEO
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Tiêu đề hiển thị Google..."
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-slate-700">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Mô tả tóm tắt cho công cụ tìm kiếm..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
