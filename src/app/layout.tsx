import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-serif',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1A1A1A',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://luxe-shop.vn'),
  title: {
    default: 'LUXE SHOP | Thời Trang & Phong Cách Sống Cao Cấp',
    template: '%s | LUXE SHOP',
  },
  description:
    'Khám phá bộ sưu tập thời trang, phụ kiện và phong cách sống thượng lưu tại LUXE SHOP. Tinh tế đến từng đường nét, nâng tầm phong cách quý phái.',
  keywords: [
    'thời trang cao cấp',
    'luxe shop',
    'phụ kiện xa xỉ',
    'hàng hiệu việt nam',
    'thời trang thượng lưu',
    'thời trang thiết kế',
  ],
  authors: [{ name: 'LUXE SHOP' }],
  creator: 'LUXE SHOP',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://luxe-shop.vn',
    siteName: 'LUXE SHOP',
    title: 'LUXE SHOP | Thời Trang & Phong Cách Sống Cao Cấp',
    description:
      'Thương hiệu thời trang và phong cách sống thượng lưu hàng đầu tại Việt Nam.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LUXE SHOP | Thời Trang & Phong Cách Sống Cao Cấp',
    description: 'Nâng tầm phong cách với các thiết kế tinh hoa từ LUXE SHOP.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-luxury-gold/20 selection:text-luxury-black" suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
              border: '1px solid rgba(201, 169, 110, 0.2)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </body>
    </html>
  );
}
