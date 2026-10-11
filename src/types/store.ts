export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price?: number | null;
  quantity: number;
  color?: string | null;
  size?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder?: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
}

export interface ProductReview {
  id: string;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  title?: string | null;
  content: string;
  isVerified?: boolean;
  createdAt: string;
  images?: string[];
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  quantity: number;
  brand?: string | null;
  tags?: string[];
  avgRating: number;
  reviewCount: number;
  soldCount: number;
  viewCount?: number;
  isActive: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
  categories?: { category: ProductCategory }[];
  reviews?: ProductReview[];
  createdAt?: string;
}

export interface CartItemType {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  sku: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  quantity: number;
  variantName?: string | null;
  color?: string | null;
  size?: string | null;
  stock: number;
}

export interface OrderItemInput {
  productId: string;
  variantId?: string | null;
  productName: string;
  productSku: string;
  productImage?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CouponItem {
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  description?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categoryName?: string;
  authorName?: string;
  publishedAt: string;
  readingTime?: string;
  viewCount: number;
  tags?: string[];
}
