'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Settings,
  Save,
  Globe,
  Phone,
  Share2,
  Truck,
  CreditCard,
  Search,
  Loader2,
  QrCode,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  UserPlus,
  Shirt,
  Bell,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStoreSettings } from '@/hooks/use-settings';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'general' | 'contact' | 'social' | 'shipping' | 'payment' | 'registration' | 'rental' | 'announcement' | 'policies' | 'seo'
  >('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [settings, setSettings] = useState({
    // General
    store_name: 'LUXE SHOP',
    store_slogan: 'Thời Trang Cao Cấp & Đẳng Cấp Thượng Lưu',
    store_logo: '/logo.png',
    store_currency: 'VND',
    // Contact
    contact_email: 'contact@luxeshop.vn',
    contact_phone: '1900 8888',
    contact_address: 'Tầng 12, Tòa nhà Bitexco, Quận 1, TP. Hồ Chí Minh',
    business_hours: '08:30 - 21:30 hàng ngày',
    // Social
    facebook_url: 'https://facebook.com/luxeshop',
    instagram_url: 'https://instagram.com/luxeshop',
    tiktok_url: 'https://tiktok.com/@luxeshop',
    // Shipping
    shipping_standard_fee: '35000',
    shipping_free_threshold: '1000000',
    // Domestic Payment
    bank_name: 'MBBank',
    bank_account_number: '8888 6666 9999',
    bank_account_name: 'LUXE SHOP VIET NAM',
    payment_qr_code: '',
    // International Payment
    enable_paypal: 'true',
    paypal_client_id: '',
    paypal_email: 'payments@luxeshop.vn',
    paypal_usd_rate: '25400',
    enable_stripe: 'true',
    stripe_publishable_key: 'pk_test_sample_stripe_key',
    stripe_secret_key: '',
    enable_swift: 'true',
    swift_bank_name: 'Vietcombank International Banking',
    swift_bic_code: 'BFTVVNVX',
    swift_account_number: '0011009876543',
    swift_beneficiary_name: 'LUXE SHOP CO., LTD',
    // Registration Settings
    register_heading: 'Tạo tài khoản LUXE VIP',
    register_subheading: 'Gia nhập câu lạc bộ khách hàng thượng lưu để nhận ngay ưu đãi độc quyền',
    register_welcome_voucher: 'WELCOME10',
    register_welcome_voucher_desc: 'Giảm ngay 10% cho đơn hàng đầu tiên',
    register_require_phone: 'optional',
    register_enable_google: 'true',
    register_min_password: '6',
    register_terms_text: 'Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của LUXE SHOP.',
    // Rental Settings
    rental_enabled: 'true',
    rental_default_price_ratio: '15',
    rental_default_deposit_ratio: '70',
    rental_hotline: '1900 8888',
    rental_policy_terms: '1. Khách hàng bảo quản trang phục cẩn thận, không tự ý cắt sửa hoặc giặt tẩy hóa chất mạnh.\n2. Tiền cọc sẽ được hoàn lại 100% khi shop nhận lại trang phục nguyên vẹn.\n3. Trường hợp rách hỏng không thể phục hồi: đền bù theo 70% giá trị gốc của sản phẩm.\n4. Thời gian trả trễ: tính thêm phí theo đơn giá thuê mỗi ngày.',
    // Announcement Bar
    announcement_enabled: 'true',
    announcement_text: 'Miễn phí vận chuyển cho đơn hàng từ 500.000₫ | Đổi trả miễn phí trong 30 ngày | Dịch vụ thuê trang phục cao cấp',
    announcement_link: '/thue-do',
    // Policies
    policy_return_terms: 'Hỗ trợ đổi trả miễn phí trong vòng 30 ngày đối với sản phẩm còn nguyên tem mác, chưa qua sử dụng và giặt là.',
    policy_privacy_terms: 'LUXE SHOP cam kết bảo mật tuyệt đối 100% thông tin cá nhân và dữ liệu thanh toán của quý khách hàng.',
    policy_shipping_terms: 'Giao hàng hỏa tốc trong 2h tại TP.HCM & Hà Nội. Giao hàng tiêu chuẩn toàn quốc từ 2-4 ngày làm việc.',
    business_tax_id: '0109888888',
    business_legal_rep: 'YIFU LUXURY VIETNAM',
    // SEO
    meta_title: 'LUXE SHOP - Thời Trang Cao Cấp',
    meta_description: 'Mua sắm thời trang dạ tiệc, blazer, đầm thiết kế cao cấp chính hãng.',
  });

  const handleUploadQr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingQr(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Lỗi khi tải ảnh lên');
      }

      const data = await res.json();
      handleChange('payment_qr_code', data.url);
      alert('Tải ảnh mã QR thành công!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi tải ảnh QR lên');
    } finally {
      setUploadingQr(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateVietQR = () => {
    const bankClean = (settings.bank_name || 'MBBank').trim().toUpperCase().replace(/\s+/g, '');
    const accClean = (settings.bank_account_number || '888866669999').trim().replace(/\s+/g, '');
    const nameParam = encodeURIComponent(settings.bank_account_name || 'LUXE SHOP VIET NAM');
    
    let bankCode = bankClean;
    if (bankCode.includes('MB')) bankCode = 'MB';
    else if (bankCode.includes('VCB') || bankCode.includes('VIETCOM')) bankCode = 'VCB';
    else if (bankCode.includes('TECH') || bankCode.includes('TCB')) bankCode = 'TCB';
    else if (bankCode.includes('ACB')) bankCode = 'ACB';
    else if (bankCode.includes('BIDV')) bankCode = 'BIDV';
    else if (bankCode.includes('VIETIN') || bankCode.includes('CTG')) bankCode = 'CTG';
    else if (bankCode.includes('TPB') || bankCode.includes('TIENPHONG')) bankCode = 'TPB';
    else if (bankCode.includes('VPB') || bankCode.includes('VPBANK')) bankCode = 'VPB';

    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accClean}-compact2.png?accountName=${nameParam}`;
    handleChange('payment_qr_code', qrUrl);
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings && Object.keys(data.settings).length > 0) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed to save');
      await useStoreSettings.getState().fetchSettings();
      alert('Đã lưu cấu hình cửa hàng thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Chung', icon: Globe },
    { id: 'payment', label: 'Thanh toán (Quốc tế & VietQR)', icon: CreditCard },
    { id: 'rental', label: 'Dịch vụ Thuê đồ', icon: Shirt },
    { id: 'announcement', label: 'Thanh thông báo Banner', icon: Bell },
    { id: 'registration', label: 'Cài đặt Đăng ký', icon: UserPlus },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck },
    { id: 'contact', label: 'Liên hệ & Doanh nghiệp', icon: Phone },
    { id: 'social', label: 'Mạng xã hội', icon: Share2 },
    { id: 'policies', label: 'Chính sách & Pháp lý', icon: FileCheck },
    { id: 'seo', label: 'SEO Mặc định', icon: Search },
  ] as const;

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Cài Đặt Cửa Hàng
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Thông tin thương hiệu, hotline, phương thức giao hàng và thông tin ngân hàng.
          </p>
        </div>

        <Button type="submit" disabled={saving} className="bg-luxury-black text-white hover:bg-luxury-black-light">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Lưu cài đặt
        </Button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'border-luxury-gold text-luxury-gold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Thông tin chung</h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tên thương hiệu</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Khẩu hiệu (Slogan)</label>
              <input
                type="text"
                value={settings.store_slogan}
                onChange={(e) => handleChange('store_slogan', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Thông tin liên hệ</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email chăm sóc khách hàng</label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Hotline hỗ trợ</label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Địa chỉ trụ sở</label>
              <input
                type="text"
                value={settings.contact_address}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Mạng xã hội</h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Facebook Fanpage</label>
              <input
                type="text"
                value={settings.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Instagram</label>
              <input
                type="text"
                value={settings.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Phí giao hàng & Freeship</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phí giao tiêu chuẩn (VNĐ)</label>
                <input
                  type="number"
                  value={settings.shipping_standard_fee}
                  onChange={(e) => handleChange('shipping_standard_fee', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Ngưỡng Freeship miễn phí (VNĐ)</label>
                <input
                  type="number"
                  value={settings.shipping_free_threshold}
                  onChange={(e) => handleChange('shipping_free_threshold', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Tài khoản Ngân hàng nhận Chuyển khoản
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Cấu hình thông tin tài khoản và mã QR để khách hàng quét chuyển khoản nhanh khi đặt hàng.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tên ngân hàng (hoặc ví điện tử)</label>
              <input
                type="text"
                placeholder="VD: MBBank, Vietcombank, Techcombank, MoMo"
                value={settings.bank_name}
                onChange={(e) => handleChange('bank_name', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Số tài khoản</label>
                <input
                  type="text"
                  placeholder="VD: 8888 6666 9999"
                  value={settings.bank_account_number}
                  onChange={(e) => handleChange('bank_account_number', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono focus:border-luxury-gold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tên chủ tài khoản</label>
                <input
                  type="text"
                  placeholder="VD: LUXE SHOP VIET NAM"
                  value={settings.bank_account_name}
                  onChange={(e) => handleChange('bank_account_name', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs uppercase focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            {/* MÃ QR THANH TOÁN (QR CODE CONFIGURATION & PREVIEW) */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-luxury-gold" />
                    Mã QR Thanh Toán (VietQR / MoMo / Ngân Hàng)
                  </h3>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    Tải ảnh mã QR của shop lên hoặc tự động tạo mã VietQR theo số tài khoản ở trên.
                  </p>
                </div>
                {settings.payment_qr_code && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Đã cấu hình mã QR
                  </span>
                )}
              </div>

              {/* Hidden File Input for QR upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadQr}
                accept="image/*"
                className="hidden"
              />

              {/* Action Buttons: Upload or Generate */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingQr}
                  className="border-slate-300 hover:border-luxury-gold text-slate-700"
                >
                  {uploadingQr ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-luxury-gold" />
                      Đang tải ảnh lên...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4 text-luxury-gold" />
                      Tải ảnh mã QR từ máy
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleGenerateVietQR}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tự động tạo VietQR từ số tài khoản
                </Button>

                {settings.payment_qr_code && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleChange('payment_qr_code', '')}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Xóa mã QR
                  </Button>
                )}
              </div>

              {/* Direct QR URL input */}
              <div className="space-y-1">
                <label className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                  Đường dẫn (URL) ảnh mã QR
                </label>
                <input
                  type="text"
                  placeholder="https://... hoặc /uploads/..."
                  value={settings.payment_qr_code}
                  onChange={(e) => handleChange('payment_qr_code', e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono focus:border-luxury-gold focus:outline-none"
                />
              </div>

              {/* LIVE PREVIEW OF THE QR CODE */}
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
                  Xem Trước Mã QR Hiển Thị Cho Khách Hàng
                </span>

                {settings.payment_qr_code ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative p-3 bg-white rounded-2xl shadow-luxury-md border border-luxury-gold/40 max-w-[220px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.payment_qr_code}
                        alt="Mã QR Thanh Toán LUXE SHOP"
                        className="w-48 h-48 object-contain rounded-xl"
                      />
                      <div className="mt-2 text-center border-t border-slate-100 pt-1.5">
                        <span className="text-2xs font-bold text-luxury-gold block uppercase tracking-wider">
                          {settings.bank_name || 'MBBank'}
                        </span>
                        <span className="text-2xs font-mono font-semibold text-slate-800">
                          {settings.bank_account_number || '8888 6666 9999'}
                        </span>
                      </div>
                    </div>

                    <p className="text-2xs text-slate-500 text-center max-w-sm">
                      Mã QR này sẽ hiển thị sắc nét tại trang thanh toán và trang đơn hàng để khách hàng mở App Ngân hàng quét thanh toán ngay lập tức.
                    </p>

                    <a
                      href={settings.payment_qr_code}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-2xs text-luxury-gold hover:underline font-semibold"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Mở xem ảnh kích thước gốc
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 space-y-2">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                      <QrCode className="h-8 w-8" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Chưa có mã QR thanh toán được thiết lập.
                    </p>
                    <p className="text-2xs text-slate-400 max-w-xs">
                      Bấm &ldquo;Tải ảnh mã QR từ máy&rdquo; hoặc bấm &ldquo;Tự động tạo VietQR từ số tài khoản&rdquo; ở trên để hiển thị mã QR.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CỔNG THANH TOÁN QUỐC TẾ (INTERNATIONAL GATEWAYS) */}
            <div className="pt-6 border-t border-slate-200 space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-luxury-gold" />
                  Cổng Thanh Toán Quốc Tế (International Gateways)
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Cấu hình nhận thanh toán bằng Thẻ Quốc tế (Visa, Mastercard), PayPal và Chuyển khoản SWIFT cho khách hàng nước ngoài.
                </p>
              </div>

              {/* 1. PAYPAL */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">1. Cổng PayPal (Toàn cầu)</h4>
                    <p className="text-2xs text-slate-500">Cho phép khách hàng quốc tế thanh toán qua tài khoản PayPal hoặc thẻ liên kết.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={settings.enable_paypal === 'true'}
                      onChange={(e) => handleChange('enable_paypal', e.target.checked ? 'true' : 'false')}
                      className="rounded border-slate-300 text-luxury-gold focus:ring-luxury-gold"
                    />
                    <span>Kích hoạt PayPal</span>
                  </label>
                </div>

                {settings.enable_paypal === 'true' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-2xs font-semibold text-slate-700">Email nhận tiền / PayPal Client ID</label>
                      <input
                        type="text"
                        placeholder="VD: payments@luxeshop.vn hoặc Client-ID"
                        value={settings.paypal_email}
                        onChange={(e) => handleChange('paypal_email', e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs bg-white focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-slate-700">Tỷ giá quy đổi (1 USD = ? VNĐ)</label>
                      <input
                        type="number"
                        placeholder="25400"
                        value={settings.paypal_usd_rate}
                        onChange={(e) => handleChange('paypal_usd_rate', e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs bg-white focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. STRIPE (VISA / MASTERCARD / JCB) */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">2. Cổng Stripe (Thẻ Quốc Tế Visa / Mastercard / JCB / Apple Pay)</h4>
                    <p className="text-2xs text-slate-500">Thanh toán trực tiếp thẻ tín dụng quốc tế bảo mật theo chuẩn PCI-DSS.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={settings.enable_stripe === 'true'}
                      onChange={(e) => handleChange('enable_stripe', e.target.checked ? 'true' : 'false')}
                      className="rounded border-slate-300 text-luxury-gold focus:ring-luxury-gold"
                    />
                    <span>Kích hoạt Stripe</span>
                  </label>
                </div>

                {settings.enable_stripe === 'true' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-slate-700">Stripe Publishable Key</label>
                      <input
                        type="text"
                        placeholder="pk_live_... hoặc pk_test_..."
                        value={settings.stripe_publishable_key}
                        onChange={(e) => handleChange('stripe_publishable_key', e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono bg-white focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-slate-700">Stripe Secret Key (Tùy chọn)</label>
                      <input
                        type="password"
                        placeholder="sk_live_... hoặc sk_test_..."
                        value={settings.stripe_secret_key}
                        onChange={(e) => handleChange('stripe_secret_key', e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono bg-white focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. SWIFT / CHUYỂN KHOẢN QUỐC TẾ */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">3. Chuyển Khoản Quốc Tế (International Wire / SWIFT Code)</h4>
                    <p className="text-2xs text-slate-500">Dành cho đơn hàng giá trị cao từ đối tác hoặc khách hàng nước ngoài chuyển điện tín ngân hàng.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={settings.enable_swift === 'true'}
                      onChange={(e) => handleChange('enable_swift', e.target.checked ? 'true' : 'false')}
                      className="rounded border-slate-300 text-luxury-gold focus:ring-luxury-gold"
                    />
                    <span>Kích hoạt SWIFT</span>
                  </label>
                </div>

                {settings.enable_swift === 'true' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-slate-700">Mã SWIFT / BIC Code</label>
                      <input
                        type="text"
                        placeholder="VD: BFTVVNVX"
                        value={settings.swift_bic_code}
                        onChange={(e) => handleChange('swift_bic_code', e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono uppercase bg-white focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-slate-700">Ngân hàng thụ hưởng quốc tế</label>
                      <input
                        type="text"
                        placeholder="VD: Vietcombank, HSBC, Citibank"
                        value={settings.swift_bank_name}
                        onChange={(e) => handleChange('swift_bank_name', e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs bg-white focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-slate-700">Số tài khoản quốc tế / IBAN</label>
                      <input
                        type="text"
                        placeholder="VD: 0011009876543"
                        value={settings.swift_account_number}
                        onChange={(e) => handleChange('swift_account_number', e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono bg-white focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-2xs font-semibold text-slate-700">Tên người thụ hưởng quốc tế (Beneficiary)</label>
                      <input
                        type="text"
                        placeholder="VD: LUXE SHOP COMPANY LIMITED"
                        value={settings.swift_beneficiary_name}
                        onChange={(e) => handleChange('swift_beneficiary_name', e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs uppercase bg-white focus:border-luxury-gold focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB CÀI ĐẶT ĐĂNG KÝ THÀNH VIÊN */}
        {activeTab === 'registration' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-luxury-gold" />
                Cấu Hình Trang Đăng Ký Tài Khoản (Registration Settings)
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Tùy chỉnh thông điệp chào mừng, mã voucher quà tặng và các quy tắc khi khách hàng đăng ký tài khoản mới.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tiêu đề chính trang đăng ký</label>
                <input
                  type="text"
                  placeholder="VD: Tạo tài khoản LUXE VIP"
                  value={settings.register_heading}
                  onChange={(e) => handleChange('register_heading', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Lời chào & Lợi ích thành viên</label>
                <input
                  type="text"
                  placeholder="VD: Gia nhập câu lạc bộ khách hàng thượng lưu để nhận ngay ưu đãi độc quyền"
                  value={settings.register_subheading}
                  onChange={(e) => handleChange('register_subheading', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mã Voucher Chào Mừng (Tặng ngay cho tài khoản mới)</label>
                  <input
                    type="text"
                    placeholder="VD: WELCOME10"
                    value={settings.register_welcome_voucher}
                    onChange={(e) => handleChange('register_welcome_voucher', e.target.value.toUpperCase())}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs font-mono font-bold text-luxury-gold uppercase focus:border-luxury-gold focus:outline-none"
                  />
                  <span className="text-2xs text-slate-400">Hiển thị nổi bật trên khung đăng ký để thu hút khách tạo tài khoản.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mô tả quà tặng voucher</label>
                  <input
                    type="text"
                    placeholder="VD: Giảm ngay 10% cho đơn hàng đầu tiên"
                    value={settings.register_welcome_voucher_desc}
                    onChange={(e) => handleChange('register_welcome_voucher_desc', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Yêu cầu số điện thoại</label>
                  <select
                    value={settings.register_require_phone}
                    onChange={(e) => handleChange('register_require_phone', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs bg-white focus:border-luxury-gold focus:outline-none"
                  >
                    <option value="optional">Tùy chọn (Khuyên dùng để đăng ký nhanh)</option>
                    <option value="required">Bắt buộc phải nhập</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Đăng nhập nhanh Google</label>
                  <select
                    value={settings.register_enable_google}
                    onChange={(e) => handleChange('register_enable_google', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs bg-white focus:border-luxury-gold focus:outline-none"
                  >
                    <option value="true">Bật nút Google OAuth</option>
                    <option value="false">Tắt nút Google</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Độ dài mật khẩu tối thiểu</label>
                  <input
                    type="number"
                    min={6}
                    max={16}
                    value={settings.register_min_password}
                    onChange={(e) => handleChange('register_min_password', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-slate-700">Nội dung xác nhận Điều khoản & Chính sách</label>
                <textarea
                  rows={2}
                  value={settings.register_terms_text}
                  onChange={(e) => handleChange('register_terms_text', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rental' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Cấu Hình Dịch Vụ Thuê Đồ</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tùy biến toàn bộ tỷ lệ giá thuê, tiền cọc và quy định thuê trang phục</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Trạng thái dịch vụ Thuê đồ</label>
                  <select
                    value={settings.rental_enabled}
                    onChange={(e) => handleChange('rental_enabled', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs bg-white focus:border-luxury-gold focus:outline-none"
                  >
                    <option value="true">Bật dịch vụ cho thuê trang phục</option>
                    <option value="false">Tạm đóng dịch vụ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Hotline tư vấn thuê đồ</label>
                  <input
                    type="text"
                    value={settings.rental_hotline}
                    onChange={(e) => handleChange('rental_hotline', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tỷ lệ giá thuê theo ngày mặc định (% giá gốc)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={settings.rental_default_price_ratio}
                    onChange={(e) => handleChange('rental_default_price_ratio', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Ví dụ: 15% (Sản phẩm 1.000.000₫ thì giá thuê là 150.000₫/ngày)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Tỷ lệ tiền cọc đảm bảo mặc định (% giá gốc)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={settings.rental_default_deposit_ratio}
                    onChange={(e) => handleChange('rental_default_deposit_ratio', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Ví dụ: 70% (Hoàn lại 100% khi nhận lại trang phục nguyên vẹn)</p>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700">Quy định & Chính sách đền bù khi thuê trang phục</label>
                <textarea
                  rows={5}
                  value={settings.rental_policy_terms}
                  onChange={(e) => handleChange('rental_policy_terms', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'announcement' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Thanh Thông Báo & Banner Nổi</h2>
              <p className="text-xs text-slate-500 mt-0.5">Thanh thông báo chạy ở đầu trang hiển thị thông điệp khuyến mãi hoặc dịch vụ mới</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Trạng thái thanh thông báo</label>
                <select
                  value={settings.announcement_enabled}
                  onChange={(e) => handleChange('announcement_enabled', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs bg-white focus:border-luxury-gold focus:outline-none"
                >
                  <option value="true">Hiển thị trên toàn bộ website</option>
                  <option value="false">Tạm ẩn thanh thông báo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nội dung thông báo (hỗ trợ phân cách dấu |)</label>
                <input
                  type="text"
                  value={settings.announcement_text}
                  onChange={(e) => handleChange('announcement_text', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Đường dẫn khi khách bấm vào</label>
                <input
                  type="text"
                  value={settings.announcement_link}
                  onChange={(e) => handleChange('announcement_link', e.target.value)}
                  placeholder="/thue-do hoặc /san-pham?sort=discount"
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Chính Sách & Pháp Lý Website</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chỉnh sửa toàn bộ nội dung chính sách hiển thị tại chân trang footer</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Mã số thuế / Giấy phép kinh doanh</label>
                  <input
                    type="text"
                    value={settings.business_tax_id}
                    onChange={(e) => handleChange('business_tax_id', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Người đại diện pháp luật / Công ty chủ quản</label>
                  <input
                    type="text"
                    value={settings.business_legal_rep}
                    onChange={(e) => handleChange('business_legal_rep', e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700">Chính sách đổi trả & hoàn tiền</label>
                <textarea
                  rows={3}
                  value={settings.policy_return_terms}
                  onChange={(e) => handleChange('policy_return_terms', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Chính sách bảo mật thông tin</label>
                <textarea
                  rows={3}
                  value={settings.policy_privacy_terms}
                  onChange={(e) => handleChange('policy_privacy_terms', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Chính sách vận chuyển & kiểm hàng</label>
                <textarea
                  rows={3}
                  value={settings.policy_shipping_terms}
                  onChange={(e) => handleChange('policy_shipping_terms', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">SEO Tiêu đề & Mô tả Google</h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Meta Title mặc định</label>
              <input
                type="text"
                value={settings.meta_title}
                onChange={(e) => handleChange('meta_title', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Meta Description mặc định</label>
              <textarea
                rows={3}
                value={settings.meta_description}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
