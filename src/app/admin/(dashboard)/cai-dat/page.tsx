'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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
  Mail,
  Shield,
  Key,
  Volume2,
  VolumeX,
  Send,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStoreSettings } from '@/hooks/use-settings';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'general' | 'email' | 'notifications' | 'admin_reg' | 'contact' | 'social' | 'shipping' | 'payment' | 'registration' | 'rental' | 'announcement' | 'policies' | 'seo'
  >('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailTarget, setTestEmailTarget] = useState('');

  // Quick admin creation
  const [newAdminFirstName, setNewAdminFirstName] = useState('');
  const [newAdminLastName, setNewAdminLastName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [settings, setSettings] = useState({
    // General & Branding
    store_name: 'LUXE SHOP',
    store_slogan: 'Thời Trang Cao Cấp & Đẳng Cấp Thượng Lưu',
    store_logo: '',
    store_favicon: '',
    brand_color: '#C9A96E',
    store_currency: 'VND',
    // Email & Gmail SMTP
    smtp_host: 'smtp.gmail.com',
    smtp_port: '465',
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: 'true',
    smtp_from_name: 'LUXE SHOP',
    admin_notify_email: '',
    // Order Notifications
    order_sound_alert_enabled: 'true',
    order_poll_interval: '15',
    browser_push_enabled: 'true',
    // Admin Registration
    allow_admin_registration: 'true',
    admin_registration_secret_key: 'YIFU@ADMIN2026',
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

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải ảnh logo');
      handleChange('store_logo', data.url);
      toast.success('Đã tải ảnh logo lên thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải logo');
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleUploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFavicon(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải favicon');
      handleChange('store_favicon', data.url);
      toast.success('Đã tải favicon lên thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải favicon');
    } finally {
      setUploadingFavicon(false);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    }
  };

  const handleTestEmail = async () => {
    const target = testEmailTarget || settings.admin_notify_email || settings.contact_email;
    if (!target) {
      toast.error('Vui lòng nhập địa chỉ email nhận thư kiểm tra');
      return;
    }
    try {
      setTestingEmail(true);
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gửi email thất bại');
      toast.success(data.message || 'Đã gửi email kiểm tra thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi gửi email kiểm tra');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleCreateQuickAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword || !newAdminFirstName) {
      toast.error('Vui lòng nhập đầy đủ thông tin nhân viên');
      return;
    }
    try {
      setCreatingAdmin(true);
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newAdminFirstName,
          lastName: newAdminLastName,
          email: newAdminEmail,
          password: newAdminPassword,
          roleId: newAdminRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tạo quản trị viên thất bại');
      toast.success(`Đã tạo tài khoản quản trị cho ${newAdminEmail} thành công!`);
      setNewAdminFirstName('');
      setNewAdminLastName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo quản trị viên');
    } finally {
      setCreatingAdmin(false);
    }
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
      toast.success('Đã lưu cấu hình cửa hàng thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Thương hiệu & Logo', icon: Globe },
    { id: 'email', label: 'Gmail SMTP & Thông báo Email', icon: Mail },
    { id: 'notifications', label: 'Chuông báo đơn mới trên Web', icon: Bell },
    { id: 'admin_reg', label: 'Quản trị viên & Đăng ký Admin', icon: Shield },
    { id: 'payment', label: 'Thanh toán (Quốc tế & VietQR)', icon: CreditCard },
    { id: 'rental', label: 'Dịch vụ Thuê đồ', icon: Shirt },
    { id: 'announcement', label: 'Thanh thông báo Banner', icon: Bell },
    { id: 'registration', label: 'Cài đặt Đăng ký Khách', icon: UserPlus },
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
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Thương hiệu & Nhận diện</h2>
              <p className="text-xs text-slate-500 mt-0.5">Tùy chỉnh tên cửa hàng, logo, favicon và giao diện hiển thị trên website</p>
            </div>

            {/* LOGO SHOP */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Logo cửa hàng (Hiển thị trên Header thanh điều hướng):
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Preview Logo */}
                <div className="h-16 w-36 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-2 overflow-hidden shadow-xs shrink-0">
                  {settings.store_logo ? (
                    <img src={settings.store_logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold text-center">Chưa có logo ảnh (Dùng logo chữ)</span>
                  )}
                </div>

                {/* Upload & URL Buttons */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleUploadLogo}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingLogo}
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-luxury-black hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-luxury-gold" />
                      <span>{uploadingLogo ? 'Đang tải logo lên...' : 'Tải logo từ máy tính'}</span>
                    </button>

                    {settings.store_logo && (
                      <button
                        type="button"
                        onClick={() => handleChange('store_logo', '')}
                        className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa logo</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="url"
                    placeholder="Hoặc dán link ảnh logo (https://...)"
                    value={settings.store_logo}
                    onChange={(e) => handleChange('store_logo', e.target.value)}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-luxury-gold focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">Khuyên dùng ảnh định dạng PNG nền trong suốt, kích thước tỷ lệ 4:1 (khoảng 240x60px).</p>
                </div>
              </div>
            </div>

            {/* FAVICON SHOP */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Biểu tượng Favicon (Hiển thị trên tab trình duyệt):
              </label>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  {settings.store_favicon ? (
                    <img src={settings.store_favicon} alt="Favicon" className="h-full w-full object-contain" />
                  ) : (
                    <Globe className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <input
                  type="file"
                  ref={faviconFileInputRef}
                  onChange={handleUploadFavicon}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingFavicon}
                  onClick={() => faviconFileInputRef.current?.click()}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>{uploadingFavicon ? 'Đang tải...' : 'Tải favicon'}</span>
                </button>
                <input
                  type="url"
                  placeholder="Hoặc URL favicon"
                  value={settings.store_favicon}
                  onChange={(e) => handleChange('store_favicon', e.target.value)}
                  className="h-9 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            {/* BRAND NAME & SLOGAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tên thương hiệu / Cửa hàng</label>
                <input
                  type="text"
                  value={settings.store_name}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs font-semibold focus:border-luxury-gold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Khẩu hiệu thương hiệu (Slogan)</label>
                <input
                  type="text"
                  value={settings.store_slogan}
                  onChange={(e) => handleChange('store_slogan', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Màu chủ đạo thương hiệu (Brand Color)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.brand_color || '#C9A96E'}
                    onChange={(e) => handleChange('brand_color', e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={settings.brand_color || '#C9A96E'}
                    onChange={(e) => handleChange('brand_color', e.target.value)}
                    className="h-10 flex-1 rounded-xl border border-slate-300 px-3 text-xs font-mono focus:border-luxury-gold focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Đơn vị tiền tệ chính</label>
                <input
                  type="text"
                  value={settings.store_currency}
                  onChange={(e) => handleChange('store_currency', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs font-semibold focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB EMAIL & GMAIL SMTP */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Cấu hình gửi Email & Gmail SMTP</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Khi khách hàng đăng ký tài khoản hoặc đặt hàng, hệ thống sẽ tự động gửi email thông báo qua tài khoản Gmail này.
              </p>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-4 h-4 text-luxury-gold" />
                <span>Hướng dẫn thiết lập gửi thư bằng Gmail miễn phí 100%:</span>
              </div>
              <p>1. Đăng nhập tài khoản Google của shop $\rightarrow$ Chọn mục <strong>Bảo mật (Security)</strong> $\rightarrow$ Bật <strong>Xác minh 2 bước</strong>.</p>
              <p>2. Tìm kiếm mục <strong>Mật khẩu ứng dụng (App Passwords)</strong> $\rightarrow$ Đặt tên &ldquo;Website Shop&rdquo; $\rightarrow$ Google sẽ cấp mã <strong>16 ký tự</strong>.</p>
              <p>3. Dán 16 ký tự đó vào ô <strong>Mật khẩu ứng dụng Gmail</strong> bên dưới.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Địa chỉ Gmail / Email gửi thư <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="email"
                  placeholder="VD: yifushop.vn@gmail.com"
                  value={settings.smtp_user}
                  onChange={(e) => handleChange('smtp_user', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs font-semibold focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Mật khẩu ứng dụng Gmail (App Password) <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="password"
                  placeholder="16 ký tự do Google cấp (VD: abcd efgh ijkl mnop)"
                  value={settings.smtp_pass}
                  onChange={(e) => handleChange('smtp_pass', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs font-mono focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tên thương hiệu hiển thị khi gửi thư:</label>
                <input
                  type="text"
                  placeholder="VD: YIFU SHOP"
                  value={settings.smtp_from_name}
                  onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Email Quản trị viên nhận thông báo khi có đơn mới:
                </label>
                <input
                  type="email"
                  placeholder="VD: chushop@gmail.com"
                  value={settings.admin_notify_email}
                  onChange={(e) => handleChange('admin_notify_email', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs font-semibold focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Máy chủ SMTP (Mặc định Gmail):</label>
                <input
                  type="text"
                  value={settings.smtp_host || 'smtp.gmail.com'}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Cổng SMTP (Port):</label>
                <input
                  type="text"
                  value={settings.smtp_port || '465'}
                  onChange={(e) => handleChange('smtp_port', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Test Email Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 pt-4">
              <label className="block text-xs font-bold text-slate-800">
                Thử nghiệm gửi thư kiểm tra (Test Email):
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn để nhận thư thử nghiệm..."
                  value={testEmailTarget}
                  onChange={(e) => setTestEmailTarget(e.target.value)}
                  className="h-10 w-full sm:flex-1 rounded-xl border border-slate-300 bg-white px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
                <button
                  type="button"
                  disabled={testingEmail}
                  onClick={handleTestEmail}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingEmail ? 'Đang gửi thử...' : 'Gửi thử Email ngay'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB CHUÔNG BÁO ĐƠN MỚI TRÊN WEB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Chuông Báo & Thông Báo Đơn Hàng Mới</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình âm thanh chuông báo và thông báo nổi khi có đơn hàng mới phát sinh trên website
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Âm thanh chuông báo đơn mới (Chime Sound)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tự động phát chuông &ldquo;Ting-Ting&rdquo; sang trọng khi có khách đặt hàng
                  </div>
                </div>
                <select
                  value={settings.order_sound_alert_enabled || 'true'}
                  onChange={(e) => handleChange('order_sound_alert_enabled', e.target.value)}
                  className="p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="true">BẬT ÂM BÁO 🔔</option>
                  <option value="false">TẮT ÂM BÁO 🔕</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Thông báo nổi trên màn hình máy tính (Desktop Push)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Hiện thông báo góc phải màn hình ngay cả khi đang chuyển tab khác
                  </div>
                </div>
                <select
                  value={settings.browser_push_enabled || 'true'}
                  onChange={(e) => handleChange('browser_push_enabled', e.target.value)}
                  className="p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="true">CHO PHÉP THÔNG BÁO</option>
                  <option value="false">KHÔNG THÔNG BÁO</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Tần suất tự động kiểm tra đơn hàng mới</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Thời gian giãn cách giữa các lần hệ thống quét đơn mới</div>
                </div>
                <select
                  value={settings.order_poll_interval || '15'}
                  onChange={(e) => handleChange('order_poll_interval', e.target.value)}
                  className="p-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="10">Mỗi 10 giây (Rất nhanh)</option>
                  <option value="15">Mỗi 15 giây (Khuyên dùng)</option>
                  <option value="30">Mỗi 30 giây</option>
                  <option value="60">Mỗi 1 phút</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB QUẢN TRỊ VIÊN & ĐĂNG KÝ ADMIN */}
        {activeTab === 'admin_reg' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quản Trị Viên & Cấu Hình Đăng Ký Admin</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý quyền truy cập trang quản trị và cấp quyền đăng ký an toàn cho nhân viên
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Cho phép đăng ký tài khoản Quản trị viên mới:</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Khi bật, nhân viên có thể đăng ký tại trang <code>/admin/dang-ky</code> với Mã Bí Mật
                  </div>
                </div>
                <select
                  value={settings.allow_admin_registration || 'true'}
                  onChange={(e) => handleChange('allow_admin_registration', e.target.value)}
                  className="p-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="true">MỞ ĐĂNG KÝ ADMIN</option>
                  <option value="false">TẠM KHÓA ĐĂNG KÝ</option>
                </select>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-slate-800">
                  Mã Bí Mật Xác Thực Đăng Ký (Admin Secret Key):
                </label>
                <input
                  type="text"
                  placeholder="VD: YIFU@ADMIN2026"
                  value={settings.admin_registration_secret_key || 'YIFU@ADMIN2026'}
                  onChange={(e) => handleChange('admin_registration_secret_key', e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 px-3 text-xs font-mono font-bold text-amber-800 focus:border-luxury-gold focus:outline-none bg-white"
                />
                <p className="text-[11px] text-slate-400">Chỉ những ai có mã bí mật này mới có thể đăng ký quyền quản trị viên.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Đường dẫn trang đăng ký Admin:</span>{' '}
                  <span className="font-mono text-luxury-gold">/admin/dang-ky</span>
                </div>
                <a
                  href="/admin/dang-ky"
                  target="_blank"
                  className="text-xs text-luxury-gold font-bold hover:underline flex items-center gap-1"
                >
                  <span>Mở trang đăng ký</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Tạo nhanh nhân viên tại đây */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Tạo Nhanh Tài Khoản Quản Trị Viên / Nhân Viên Mới:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Họ & Tên đệm (VD: Nguyễn)"
                  value={newAdminLastName}
                  onChange={(e) => setNewAdminLastName(e.target.value)}
                  className="h-9 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Tên (VD: An)"
                  value={newAdminFirstName}
                  onChange={(e) => setNewAdminFirstName(e.target.value)}
                  className="h-9 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="Email đăng nhập nhân viên"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="h-9 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Mật khẩu đăng nhập (tối thiểu 6 ký tự)"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="h-9 rounded-xl border border-slate-300 px-3 text-xs bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/admin/nhan-vien"
                  className="text-xs text-luxury-gold hover:underline font-semibold"
                >
                  Quản lý danh sách nhân sự chi tiết →
                </Link>

                <button
                  type="button"
                  disabled={creatingAdmin}
                  onClick={handleCreateQuickAdmin}
                  className="btn-gold px-5 py-2 text-xs font-bold rounded-xl shadow-xs"
                >
                  {creatingAdmin ? 'Đang tạo...' : '+ Tạo tài khoản Admin mới'}
                </button>
              </div>
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
