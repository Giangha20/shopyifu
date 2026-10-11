import { z } from 'zod';

// ========================================
// AUTH VALIDATIONS
// ========================================

export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ').max(50, 'Họ không quá 50 ký tự'),
  lastName: z.string().min(1, 'Vui lòng nhập tên').max(50, 'Tên không quá 50 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0[1-9])\d{8,9}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

// ========================================
// PROFILE VALIDATIONS
// ========================================

export const profileSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ').max(50),
  lastName: z.string().min(1, 'Vui lòng nhập tên').max(50),
  phone: z.string().regex(/^(0[1-9])\d{8,9}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
  avatar: z.string().optional().nullable(),
  newsletterSubscribed: z.boolean().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên').max(100),
  phone: z.string().regex(/^(0[1-9])\d{8,9}$/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  street: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết').max(200),
  isDefault: z.boolean().optional(),
});

// ========================================
// PRODUCT VALIDATIONS
// ========================================

export const productSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên sản phẩm').max(200),
  sku: z.string().min(1, 'Vui lòng nhập mã SKU').max(50),
  shortDescription: z.string().max(1000).optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'Giá không hợp lệ'),
  compareAtPrice: z.number().min(0).optional().nullable(),
  costPrice: z.number().min(0).optional().nullable(),
  quantity: z.number().int().min(0, 'Số lượng không hợp lệ'),
  lowStockThreshold: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  categoryIds: z.array(z.string()).optional(),
});

export const productVariantSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên biến thể'),
  sku: z.string().min(1, 'Vui lòng nhập mã SKU'),
  price: z.number().min(0).optional().nullable(),
  quantity: z.number().int().min(0),
  color: z.string().optional(),
  size: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ========================================
// CATEGORY VALIDATIONS
// ========================================

export const categorySchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên danh mục').max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

// ========================================
// ORDER VALIDATIONS
// ========================================

export const checkoutSchema = z.object({
  shippingName: z.string().min(1, 'Vui lòng nhập họ tên'),
  shippingPhone: z.string().regex(/^(0[1-9])\d{8,9}$/, 'Số điện thoại không hợp lệ'),
  shippingEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  shippingProvince: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  shippingDistrict: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  shippingWard: z.string().min(1, 'Vui lòng chọn phường/xã'),
  shippingStreet: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
  paymentMethod: z.enum(['cod', 'bank_transfer', 'vnpay', 'momo', 'paypal', 'stripe_card', 'swift_wire']),
  shippingMethod: z.string().min(1),
  customerNote: z.string().max(500).optional(),
  couponCode: z.string().optional(),
  addressId: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending', 'confirmed', 'preparing', 'shipping',
    'delivered', 'cancelled', 'return_requested', 'returning', 'returned',
  ]),
  note: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
});

// ========================================
// COUPON VALIDATIONS
// ========================================

export const couponSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã').max(50).transform((v) => v.toUpperCase()),
  name: z.string().min(1, 'Vui lòng nhập tên khuyến mãi').max(200),
  description: z.string().max(500).optional(),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  value: z.number().min(0, 'Giá trị không hợp lệ'),
  minOrderAmount: z.number().min(0).optional().nullable(),
  maxDiscount: z.number().min(0).optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  usageLimitPerUser: z.number().int().min(1).optional().nullable(),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  isActive: z.boolean().optional(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
});

// ========================================
// REVIEW VALIDATIONS
// ========================================

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1, 'Vui lòng chọn số sao').max(5),
  title: z.string().max(200).optional(),
  content: z.string().max(2000).optional(),
});

// ========================================
// SUPPORT VALIDATIONS
// ========================================

export const supportTicketSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên').max(100),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Vui lòng nhập tiêu đề').max(200),
  message: z.string().min(1, 'Vui lòng nhập nội dung').max(5000),
});

// ========================================
// NEWSLETTER VALIDATION
// ========================================

export const newsletterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

// ========================================
// BANNER VALIDATIONS
// ========================================

export const bannerSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(200),
  subtitle: z.string().max(300).optional(),
  link: z.string().url().optional().or(z.literal('')),
  buttonText: z.string().max(50).optional(),
  position: z.enum(['hero', 'sidebar', 'popup']).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ========================================
// ARTICLE VALIDATIONS
// ========================================

export const articleSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Vui lòng nhập nội dung'),
  categoryId: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

// ========================================
// CART VALIDATIONS
// ========================================

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Mã sản phẩm không hợp lệ'),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, 'Số lượng tối thiểu là 1'),
});

export const updateCartItemSchema = z.object({
  id: z.string().min(1, 'Mã mục giỏ hàng không hợp lệ'),
  quantity: z.number().int().min(1, 'Số lượng tối thiểu là 1'),
});

// ========================================
// INVENTORY VALIDATIONS
// ========================================

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().int(),
  reason: z.string().min(1, 'Vui lòng nhập lý do'),
  reference: z.string().optional(),
  note: z.string().optional(),
});

// ========================================
// SHIPPING METHOD VALIDATIONS
// ========================================

export const shippingMethodSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên phương thức vận chuyển'),
  description: z.string().optional(),
  baseFee: z.number().min(0, 'Phí vận chuyển không hợp lệ'),
  freeAbove: z.number().min(0).optional().nullable(),
  estimatedDays: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// ========================================
// STORE SETTING VALIDATIONS
// ========================================

export const storeSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json', 'html']).optional(),
  group: z.string().optional(),
  label: z.string().optional(),
});

// ========================================
// STAFF VALIDATIONS
// ========================================

export const staffCreateSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ'),
  lastName: z.string().min(1, 'Vui lòng nhập tên'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 vai trò'),
});

export const staffUpdateSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập họ').optional(),
  lastName: z.string().min(1, 'Vui lòng nhập tên').optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string()).optional(),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentSchema>;
export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>;
export type StoreSettingInput = z.infer<typeof storeSettingSchema>;
export type StaffCreateInput = z.infer<typeof staffCreateSchema>;
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;

