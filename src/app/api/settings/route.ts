import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.storeSetting.findMany();

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const storeName = settingsMap['store_name'] || settingsMap['site_name'] || 'LUXE SHOP';
    const contactEmail = settingsMap['contact_email'] || settingsMap['store_email'] || 'contact@luxeshop.vn';
    const contactPhone = settingsMap['contact_phone'] || settingsMap['store_phone'] || '1900 8888';
    const contactAddress = settingsMap['contact_address'] || settingsMap['store_address'] || 'Toà nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh';
    const businessHours = settingsMap['business_hours'] || '08:30 - 21:30 hàng ngày';

    const responseData = {
      siteName: storeName,
      storeName: storeName,
      siteDescription: settingsMap['store_slogan'] || settingsMap['site_description'] || 'Thời Trang Cao Cấp & Đẳng Cấp Thượng Lưu',
      storeSlogan: settingsMap['store_slogan'] || 'Thời Trang Cao Cấp & Đẳng Cấp Thượng Lưu',
      contactEmail,
      contactPhone,
      contactAddress,
      businessHours,
      facebook: settingsMap['facebook_url'] || 'https://facebook.com/luxeshop',
      instagram: settingsMap['instagram_url'] || 'https://instagram.com/luxeshop',
      tiktok: settingsMap['tiktok_url'] || 'https://tiktok.com/@luxeshop',
      freeShippingThreshold: Number(settingsMap['shipping_free_threshold'] || settingsMap['free_shipping_threshold'] || 500000),
      currency: settingsMap['store_currency'] || 'VND',
      currencySymbol: '₫',
      ...settingsMap,
    };

    return NextResponse.json({ data: responseData, settings: settingsMap });
  } catch (error) {
    console.error('Get public settings error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy cài đặt cửa hàng' },
      { status: 500 }
    );
  }
}
