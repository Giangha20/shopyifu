import { create } from 'zustand';

export interface StoreSettings {
  storeName: string;
  storeSlogan: string;
  storeLogo?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  businessHours: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  shippingStandardFee: number;
  shippingFreeThreshold: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  paymentQrCode: string;
}

const defaultSettings: StoreSettings = {
  storeName: 'SHOP QUAN AO',
  storeSlogan: 'Thời Trang Cao Cấp & Đẳng Cấp Phong Cách',
  contactEmail: 'contact@shopquanao.vn',
  contactPhone: '0901 234 567',
  contactAddress: '123 Đường Thời Trang, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  businessHours: '08:30 - 21:30 hàng ngày',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  tiktokUrl: 'https://tiktok.com',
  shippingStandardFee: 35000,
  shippingFreeThreshold: 500000,
  bankName: 'MBBank',
  bankAccountNumber: '8888 6666 9999',
  bankAccountName: 'SHOP QUAN AO',
  paymentQrCode: '',
};

interface SettingsStore {
  settings: StoreSettings;
  isLoaded: boolean;
  fetchSettings: () => Promise<void>;
}

export const useStoreSettings = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  isLoaded: false,
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        set({
          settings: {
            storeName: data.store_name || data.siteName || data.storeName || defaultSettings.storeName,
            storeSlogan: data.store_slogan || data.siteDescription || defaultSettings.storeSlogan,
            storeLogo: data.store_logo || data.storeLogo || '',
            contactEmail: data.contact_email || data.contactEmail || defaultSettings.contactEmail,
            contactPhone: data.contact_phone || data.contactPhone || defaultSettings.contactPhone,
            contactAddress: data.contact_address || data.contactAddress || defaultSettings.contactAddress,
            businessHours: data.business_hours || data.businessHours || defaultSettings.businessHours,
            facebookUrl: data.facebook_url || data.facebook || defaultSettings.facebookUrl,
            instagramUrl: data.instagram_url || data.instagram || defaultSettings.instagramUrl,
            tiktokUrl: data.tiktok_url || data.tiktok || defaultSettings.tiktokUrl,
            shippingStandardFee: Number(data.shipping_standard_fee || defaultSettings.shippingStandardFee),
            shippingFreeThreshold: Number(data.freeShippingThreshold || data.shipping_free_threshold || defaultSettings.shippingFreeThreshold),
            bankName: data.bank_name || data.bankName || defaultSettings.bankName,
            bankAccountNumber: data.bank_account_number || data.bankAccountNumber || defaultSettings.bankAccountNumber,
            bankAccountName: data.bank_account_name || data.bankAccountName || defaultSettings.bankAccountName,
            paymentQrCode: data.payment_qr_code || data.paymentQrCode || defaultSettings.paymentQrCode,
          },
          isLoaded: true,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch store settings:', err);
    }
  },
}));
