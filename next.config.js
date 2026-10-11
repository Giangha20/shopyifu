/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 768, 1024, 1280, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  async redirects() {
    return [
      { source: '/auth/login', destination: '/dang-nhap', permanent: true },
      { source: '/auth/register', destination: '/dang-ky', permanent: true },
      { source: '/login', destination: '/dang-nhap', permanent: true },
      { source: '/register', destination: '/dang-ky', permanent: true },
      { source: '/products', destination: '/san-pham', permanent: true },
      { source: '/products/:slug', destination: '/san-pham/:slug', permanent: true },
      { source: '/categories', destination: '/san-pham', permanent: true },
      { source: '/categories/:slug', destination: '/danh-muc/:slug', permanent: true },
      { source: '/cart', destination: '/gio-hang', permanent: true },
      { source: '/checkout', destination: '/thanh-toan', permanent: true },
      { source: '/wishlist', destination: '/yeu-thich', permanent: true },
      { source: '/search', destination: '/tim-kiem', permanent: true },
      { source: '/account', destination: '/tai-khoan', permanent: true },
      { source: '/account/:path*', destination: '/tai-khoan/:path*', permanent: true },
      { source: '/contact', destination: '/lien-he', permanent: true },
      { source: '/about', destination: '/gioi-thieu', permanent: true },
      { source: '/blog', destination: '/bai-viet', permanent: true },
      { source: '/blog/:slug', destination: '/bai-viet/:slug', permanent: true },
      { source: '/faq', destination: '/cau-hoi-thuong-gap', permanent: true },
      { source: '/shipping-policy', destination: '/chinh-sach/van-chuyen', permanent: true },
      { source: '/return-policy', destination: '/chinh-sach/doi-tra', permanent: true },
      { source: '/privacy-policy', destination: '/chinh-sach/bao-mat', permanent: true },
      { source: '/terms-of-service', destination: '/chinh-sach/dieu-khoan', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

};

module.exports = nextConfig;
