// ─── Supabase Database Types ─────────────────────────────────────────────────

export type UserRole = "customer" | "admin";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cod" | "sslcommerz" | "bkash" | "nagad";
export type ProductStatus = "draft" | "active" | "archived";
export type CollectionType =
  | "seasonal"
  | "curated"
  | "sale"
  | "new_arrival"
  | "limited";
export type BannerPlacement = "hero" | "mid" | "footer" | "popup" | "category";
export type CouponType = "percentage" | "fixed";
export type NotificationType = "info" | "order" | "promo" | "system";
export type AddressLabel = "Home" | "Office" | "Other";
export type ProductSize =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL"
  | "28"
  | "30"
  | "32"
  | "34"
  | "36"
  | "38"
  | "40"
  | "42"
  | "Free";

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  district: string;
  division: string;
  postal_code: string;
  is_default: boolean;
  label: AddressLabel;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner_url: string;
  badge_text: string;
  type: CollectionType;
  is_active: boolean;
  is_featured: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  image_url_mobile: string;
  placement: BannerPlacement;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  short_desc: string;
  base_price: number;
  sale_price: number | null;
  cost_price: number;
  sku_prefix: string;
  brand: string;
  material: string;
  care_instructions: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_flash_sale: boolean;
  flash_sale_ends_at: string | null;
  status: ProductStatus;
  total_stock: number;
  total_sold: number;
  avg_rating: number;
  review_count: number;
  weight_grams: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  collections?: Collection[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  cloudinary_id: string;
  width: number;
  height: number;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: ProductSize;
  color: string;
  color_hex: string;
  price: number;
  sale_price: number | null;
  stock_qty: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  user_id: string;
  session_id: string | null;
  coupon_code: string;
  discount: number;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  ship_full_name: string;
  ship_phone: string;
  ship_address: string;
  ship_city: string;
  ship_district: string;
  ship_division: string;
  ship_postal: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  tax: number;
  total: number;
  coupon_code: string;
  notes: string;
  tracking_number: string;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_sku: string;
  size: string;
  color: string;
  image_url: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  method: PaymentMethod;
  status: string;
  amount: number;
  currency: string;
  transaction_id: string;
  gateway_response: Record<string, unknown>;
  val_id: string;
  bank_tran_id: string;
  paid_at: string | null;
  refunded_at: string | null;
  refund_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string;
  body: string;
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  profile?: Pick<Profile, "full_name" | "avatar_url">;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

// ─── UI / App-level types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ProductFilters {
  category?: string;
  collection?: string;
  min_price?: number;
  max_price?: number;
  sizes?: string[];
  colors?: string[];
  sort?: "newest" | "price_asc" | "price_desc" | "popular" | "rating";
  search?: string;
  page?: number;
  per_page?: number;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  is_flash_sale?: boolean;
}

export interface CheckoutFormData {
  full_name: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  district: string;
  division: string;
  postal_code?: string;
  payment_method: PaymentMethod;
  notes?: string;
  coupon_code?: string;
  save_address?: boolean;
}

export interface CartSummary {
  subtotal: number;
  shipping_fee: number;
  discount: number;
  tax: number;
  total: number;
  item_count: number;
}
