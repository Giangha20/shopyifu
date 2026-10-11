import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, SAMPLE_ARTICLES } from './sample-data';
import { ProductItem, ProductCategory, ArticleItem } from '@/types/store';

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
  color?: string;
  size?: string;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<{
  products: ProductItem[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  // If running on the Server, read directly from database for 100% sync and zero URL errors
  if (typeof window === 'undefined') {
    try {
      const { prisma } = await import('@/lib/db');
      const limit = filters.limit || 12;
      const page = filters.page || 1;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters.category && filters.category !== 'all') {
        where.categories = {
          some: {
            category: {
              OR: [
                { slug: filters.category },
                { id: filters.category },
              ],
            },
          },
        };
      }
      if (filters.brand && filters.brand !== 'all') {
        where.brand = { equals: filters.brand, mode: 'insensitive' };
      }
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      let orderBy: any = { createdAt: 'desc' };
      if (filters.sort === 'price-asc') orderBy = { price: 'asc' };
      else if (filters.sort === 'price-desc') orderBy = { price: 'desc' };
      else if (filters.sort === 'bestselling') orderBy = { soldCount: 'desc' };
      else if (filters.sort === 'rating') orderBy = { avgRating: 'desc' };

      const [total, dbProducts] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            categories: { include: { category: true } },
            variants: { orderBy: { sortOrder: 'asc' } },
          },
        }),
      ]);

      if (dbProducts.length > 0) {
        const formatted: ProductItem[] = dbProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          shortDescription: p.shortDescription,
          description: p.description,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          costPrice: p.costPrice ? Number(p.costPrice) : null,
          quantity: p.quantity,
          avgRating: Number(p.avgRating || 5),
          reviewCount: p.reviewCount || 0,
          brand: p.brand,
          tags: p.tags,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          isBestseller: p.isBestseller,
          images: p.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
          categories: p.categories.map((c) => ({
            category: {
              id: c.category.id,
              name: c.category.name,
              slug: c.category.slug,
            },
          })),
          variants: p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: v.price ? Number(v.price) : null,
            quantity: v.quantity,
            color: v.color || '',
            size: v.size || '',
            image: v.image,
          })),
        })) as unknown as ProductItem[];

        return {
          products: formatted,
          total,
          totalPages: Math.ceil(total / limit) || 1,
          currentPage: page,
        };
      }
    } catch (err) {
      console.warn('Prisma lookup failed in fetchProducts:', err);
    }
  }

  // Client-side fetch
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      if (filters.brand && filters.brand !== 'all') params.set('brand', filters.brand);
      if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.rating) params.set('rating', filters.rating.toString());
      if (filters.search) params.set('q', filters.search);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.color) params.set('color', filters.color);
      if (filters.size) params.set('size', filters.size);

      const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          const formatted: ProductItem[] = data.data.map((p: any) => ({
            ...p,
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            avgRating: Number(p.avgRating || 5),
            images: p.images || [],
            variants: (p.variants || []).map((v: any) => ({
              ...v,
              price: v.price ? Number(v.price) : null,
            })),
          }));

          return {
            products: formatted,
            total: data.pagination?.total ?? formatted.length,
            totalPages: data.pagination?.totalPages || 1,
            currentPage: data.pagination?.page || 1,
          };
        }
      }
    } catch (err) {
      console.warn('Falling back to local cache for products:', err);
    }
  }

  // Fallback to sample data
  let filtered = [...SAMPLE_PRODUCTS];

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((p) =>
      p.categories?.some((c) => c.category.slug === filters.category || c.category.id === filters.category)
    );
  }

  if (filters.brand && filters.brand !== 'all') {
    filtered = filtered.filter((p) => p.brand?.toLowerCase() === filters.brand?.toLowerCase());
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= (filters.minPrice ?? 0));
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
  }

  if (filters.rating) {
    filtered = filtered.filter((p) => p.avgRating >= (filters.rating ?? 0));
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.brand?.toLowerCase().includes(q)
    );
  }

  const limit = filters.limit || 12;
  const page = filters.page || 1;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const products = filtered.slice(start, start + limit);

  return {
    products,
    total,
    totalPages,
    currentPage: page,
  };
}

export async function fetchProductBySlug(slug: string): Promise<ProductItem | null> {
  // If running on the Server, read directly from database with decoded & OR conditions
  if (typeof window === 'undefined') {
    try {
      const { prisma } = await import('@/lib/db');
      const decoded = decodeURIComponent(slug);
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { slug },
            { id: slug },
            { slug: decoded },
            { id: decoded },
          ],
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          categories: { include: { category: true } },
          variants: { orderBy: { sortOrder: 'asc' } },
          attributes: { orderBy: { sortOrder: 'asc' } },
        },
      });

      if (product) {
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          shortDescription: product.shortDescription,
          description: product.description,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          costPrice: product.costPrice ? Number(product.costPrice) : null,
          quantity: product.quantity,
          avgRating: Number(product.avgRating || 5),
          reviewCount: product.reviewCount || 0,
          brand: product.brand,
          tags: product.tags,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          isBestseller: product.isBestseller,
          images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
          categories: product.categories.map((c) => ({
            category: {
              id: c.category.id,
              name: c.category.name,
              slug: c.category.slug,
            },
          })),
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: v.price ? Number(v.price) : null,
            quantity: v.quantity,
            color: v.color || '',
            size: v.size || '',
            image: v.image,
          })),
          attributes: product.attributes.map((a) => ({
            name: a.name,
            value: a.value,
          })),
        } as unknown as ProductItem;
      }
    } catch (err) {
      console.warn('Prisma lookup failed in fetchProductBySlug:', err);
    }
  }

  // Client-side fetch
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const p = data.data;
          return {
            ...p,
            price: Number(p.price),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            avgRating: Number(p.avgRating || 5),
            images: p.images || [],
            variants: (p.variants || []).map((v: any) => ({
              ...v,
              price: v.price ? Number(v.price) : null,
            })),
          };
        }
      }
    } catch (err) {
      console.warn('Falling back to local cache for product detail:', err);
    }
  }

  const found = SAMPLE_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  if (typeof window === 'undefined') {
    try {
      const { prisma } = await import('@/lib/db');
      const cats = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      if (cats.length > 0) {
        return cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image: c.image || '',
          itemCount: 0,
        })) as unknown as ProductCategory[];
      }
    } catch (err) {
      console.warn('Prisma lookup failed in fetchCategories:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      }
    } catch (err) {
      console.warn('Falling back to local cache for categories:', err);
    }
  }
  return SAMPLE_CATEGORIES;
}

export async function fetchCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  if (typeof window === 'undefined') {
    try {
      const { prisma } = await import('@/lib/db');
      const decoded = decodeURIComponent(slug);
      const cat = await prisma.category.findFirst({
        where: {
          OR: [
            { slug },
            { id: slug },
            { slug: decoded },
            { id: decoded },
          ],
        },
      });
      if (cat) {
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          image: cat.image || '',
          itemCount: 0,
        } as unknown as ProductCategory;
      }
    } catch (err) {
      console.warn('Prisma lookup failed in fetchCategoryBySlug:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(slug)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.data) return data.data;
      }
    } catch (err) {
      console.warn('Falling back to local cache for category by slug:', err);
    }
  }

  const found = SAMPLE_CATEGORIES.find((c) => c.slug === slug || c.id === slug);
  return found || null;
}

export async function fetchArticles(): Promise<ArticleItem[]> {
  return SAMPLE_ARTICLES;
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleItem | null> {
  const found = SAMPLE_ARTICLES.find((a) => a.slug === slug || a.id === slug);
  return found || null;
}
