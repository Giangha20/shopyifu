import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://luxeshop.vn';

  // Static high-priority pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/san-pham`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/danh-muc`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bai-viet`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gioi-thieu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/chinh-sach-doi-tra`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/chinh-sach-bao-mat`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dieu-khoan-dich-vu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  try {
    // 1. Fetch active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const productEntries: MetadataRoute.Sitemap = products.map((prod) => ({
      url: `${baseUrl}/san-pham/${prod.slug}`,
      lastModified: prod.updatedAt,
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    // 2. Fetch active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/danh-muc/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // 3. Fetch published articles
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    });

    const articleEntries: MetadataRoute.Sitemap = articles.map((art) => ({
      url: `${baseUrl}/bai-viet/${art.slug}`,
      lastModified: art.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticPages, ...productEntries, ...categoryEntries, ...articleEntries];
  } catch (error) {
    console.error('Error generating dynamic sitemap, returning static pages fallback:', error);
    return staticPages;
  }
}
