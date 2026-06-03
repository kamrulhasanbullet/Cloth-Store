/*
  # Men's Fashion E-Commerce — Complete Database Schema (Part 1)
  Creates all tables, indexes, RLS, and seed data.
  The is_admin() helper function is created AFTER profiles so the reference resolves.
*/

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text NOT NULL DEFAULT '',
  phone         text DEFAULT '',
  avatar_url    text DEFAULT '',
  role          text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-update helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 0. HELPER: admin check (after profiles exists)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles RLS
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'customer');

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────
-- 2. ADDRESSES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  phone         text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text DEFAULT '',
  city          text NOT NULL,
  district      text NOT NULL,
  division      text NOT NULL DEFAULT 'Dhaka',
  postal_code   text DEFAULT '',
  is_default    boolean NOT NULL DEFAULT false,
  label         text DEFAULT 'Home' CHECK (label IN ('Home', 'Office', 'Other')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses"
  ON public.addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses"
  ON public.addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses"
  ON public.addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER addresses_updated_at
  BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 3. CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text DEFAULT '',
  image_url   text DEFAULT '',
  parent_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 4. COLLECTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text DEFAULT '',
  banner_url      text DEFAULT '',
  badge_text      text DEFAULT '',
  type            text NOT NULL DEFAULT 'seasonal' CHECK (type IN ('seasonal','curated','sale','new_arrival','limited')),
  is_active       boolean NOT NULL DEFAULT true,
  is_featured     boolean NOT NULL DEFAULT false,
  starts_at       timestamptz,
  ends_at         timestamptz,
  sort_order      integer NOT NULL DEFAULT 0,
  seo_title       text DEFAULT '',
  seo_description text DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_is_active ON public.collections(is_active);
CREATE INDEX IF NOT EXISTS idx_collections_is_featured ON public.collections(is_featured);
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active collections"
  ON public.collections FOR SELECT
  USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "Admins can insert collections" ON public.collections FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update collections" ON public.collections FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete collections" ON public.collections FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 5. BANNERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  subtitle        text DEFAULT '',
  cta_text        text DEFAULT '',
  cta_url         text DEFAULT '',
  image_url       text NOT NULL,
  image_url_mobile text DEFAULT '',
  placement       text NOT NULL DEFAULT 'hero' CHECK (placement IN ('hero','mid','footer','popup','category')),
  is_active       boolean NOT NULL DEFAULT true,
  starts_at       timestamptz,
  ends_at         timestamptz,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_placement ON public.banners(placement);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners"
  ON public.banners FOR SELECT
  USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()));
CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 6. PRODUCTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id         uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name                text NOT NULL,
  slug                text NOT NULL UNIQUE,
  description         text DEFAULT '',
  short_desc          text DEFAULT '',
  base_price          numeric(10,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  sale_price          numeric(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
  cost_price          numeric(10,2) DEFAULT 0,
  sku_prefix          text DEFAULT '',
  brand               text DEFAULT '',
  material            text DEFAULT '',
  care_instructions   text DEFAULT '',
  tags                text[] NOT NULL DEFAULT '{}',
  is_active           boolean NOT NULL DEFAULT true,
  is_featured         boolean NOT NULL DEFAULT false,
  is_new_arrival      boolean NOT NULL DEFAULT false,
  is_best_seller      boolean NOT NULL DEFAULT false,
  is_flash_sale       boolean NOT NULL DEFAULT false,
  flash_sale_ends_at  timestamptz,
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  total_stock         integer NOT NULL DEFAULT 0,
  total_sold          integer NOT NULL DEFAULT 0,
  avg_rating          numeric(3,2) NOT NULL DEFAULT 0,
  review_count        integer NOT NULL DEFAULT 0,
  weight_grams        integer DEFAULT 0,
  seo_title           text DEFAULT '',
  seo_description     text DEFAULT '',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON public.products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON public.products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_is_flash_sale ON public.products(is_flash_sale);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true AND status = 'active');
CREATE POLICY "Admins can view all products" ON public.products FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 7. PRODUCT IMAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url           text NOT NULL,
  alt_text      text DEFAULT '',
  cloudinary_id text DEFAULT '',
  width         integer DEFAULT 0,
  height        integer DEFAULT 0,
  sort_order    integer NOT NULL DEFAULT 0,
  is_primary    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON public.product_images(is_primary);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert product images" ON public.product_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update product images" ON public.product_images FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete product images" ON public.product_images FOR DELETE TO authenticated USING (public.is_admin());

-- ─────────────────────────────────────────────
-- 8. PRODUCT VARIANTS (SKUs)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku                  text NOT NULL UNIQUE,
  size                 text NOT NULL DEFAULT 'M' CHECK (size IN ('XS','S','M','L','XL','XXL','XXXL','28','30','32','34','36','38','40','42','Free')),
  color                text DEFAULT '',
  color_hex            text DEFAULT '',
  price                numeric(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  sale_price           numeric(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
  stock_qty            integer NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  low_stock_threshold  integer NOT NULL DEFAULT 5,
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active variants" ON public.product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all variants" ON public.product_variants FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert variants" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update variants" ON public.product_variants FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete variants" ON public.product_variants FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER variants_updated_at
  BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 9. PRODUCT COLLECTIONS (many-to-many)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_collections (
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  sort_order    integer NOT NULL DEFAULT 0,
  added_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON public.product_collections(collection_id);
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product-collections" ON public.product_collections FOR SELECT USING (true);
CREATE POLICY "Admins can insert product-collections" ON public.product_collections FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update product-collections" ON public.product_collections FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete product-collections" ON public.product_collections FOR DELETE TO authenticated USING (public.is_admin());

-- ─────────────────────────────────────────────
-- 10. WISHLISTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist" ON public.wishlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to own wishlist" ON public.wishlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from own wishlist" ON public.wishlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 11. CARTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.carts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id  text,
  coupon_code text DEFAULT '',
  discount    numeric(10,2) NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON public.carts(session_id);
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart" ON public.carts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON public.carts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.carts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON public.carts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 12. CART ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id  uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity    integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price  numeric(10,2) NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON public.cart_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own cart items"
  ON public.cart_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own cart items"
  ON public.cart_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()));

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 13. COUPONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text NOT NULL UNIQUE,
  description      text DEFAULT '',
  type             text NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage','fixed')),
  value            numeric(10,2) NOT NULL DEFAULT 0 CHECK (value > 0),
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0,
  max_discount     numeric(10,2),
  usage_limit      integer,
  usage_count      integer NOT NULL DEFAULT 0,
  per_user_limit   integer NOT NULL DEFAULT 1,
  is_active        boolean NOT NULL DEFAULT true,
  starts_at        timestamptz,
  expires_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active coupons"
  ON public.coupons FOR SELECT TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Admins can insert coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update coupons" ON public.coupons FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete coupons" ON public.coupons FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER coupons_updated_at
  BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 14. ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    text NOT NULL UNIQUE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status  text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  payment_method  text NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod','sslcommerz','bkash','nagad')),
  ship_full_name  text NOT NULL DEFAULT '',
  ship_phone      text NOT NULL DEFAULT '',
  ship_address    text NOT NULL DEFAULT '',
  ship_city       text NOT NULL DEFAULT '',
  ship_district   text NOT NULL DEFAULT '',
  ship_division   text NOT NULL DEFAULT '',
  ship_postal     text DEFAULT '',
  subtotal        numeric(10,2) NOT NULL DEFAULT 0,
  shipping_fee    numeric(10,2) NOT NULL DEFAULT 0,
  discount        numeric(10,2) NOT NULL DEFAULT 0,
  tax             numeric(10,2) NOT NULL DEFAULT 0,
  total           numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code     text DEFAULT '',
  notes           text DEFAULT '',
  tracking_number text DEFAULT '',
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  cancelled_at    timestamptz,
  cancel_reason   text DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update all orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 15. ORDER ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id    uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  product_name  text NOT NULL,
  variant_sku   text NOT NULL,
  size          text NOT NULL DEFAULT '',
  color         text DEFAULT '',
  image_url     text DEFAULT '',
  quantity      integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price    numeric(10,2) NOT NULL DEFAULT 0,
  total_price   numeric(10,2) NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert all order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────
-- 16. PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  method            text NOT NULL DEFAULT 'cod' CHECK (method IN ('cod','sslcommerz','bkash','nagad')),
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded','cancelled')),
  amount            numeric(10,2) NOT NULL DEFAULT 0,
  currency          text NOT NULL DEFAULT 'BDT',
  transaction_id    text DEFAULT '',
  gateway_response  jsonb DEFAULT '{}',
  val_id            text DEFAULT '',
  bank_tran_id      text DEFAULT '',
  paid_at           timestamptz,
  refunded_at       timestamptz,
  refund_amount     numeric(10,2) DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update all payments" ON public.payments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 17. REVIEWS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id      uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rating        integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         text DEFAULT '',
  body          text DEFAULT '',
  is_verified   boolean NOT NULL DEFAULT false,
  is_approved   boolean NOT NULL DEFAULT false,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can view own reviews" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pending reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_approved = false) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update all reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.products
  SET
    avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER after_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ─────────────────────────────────────────────
-- 18. NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text NOT NULL DEFAULT 'info' CHECK (type IN ('info','order','promo','system')),
  title       text NOT NULL,
  body        text DEFAULT '',
  link        text DEFAULT '',
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────
-- 19. SEED DATA
-- ─────────────────────────────────────────────
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Shirts',   'shirts',   'Formal and casual shirts for men', 1),
  ('Pants',    'pants',    'Formal pants, chinos, and trousers', 2),
  ('T-Shirts', 't-shirts', 'Casual and graphic tees', 3),
  ('Jerseys',  'jerseys',  'Sports and fashion jerseys', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.collections (name, slug, description, type, is_active, is_featured, sort_order, badge_text) VALUES
  ('Summer Collection',  'summer',          'Light and breathable summer fashion',        'seasonal',    true, true,  1, 'Summer'),
  ('Winter Collection',  'winter',          'Warm and cozy winter essentials',            'seasonal',    true, false, 2, 'Winter'),
  ('Eid Collection',     'eid',             'Festive wear for Eid celebrations',          'seasonal',    true, true,  3, 'Eid Special'),
  ('New Arrivals',       'new-arrivals',    'Fresh new styles just dropped',              'new_arrival', true, true,  4, 'New'),
  ('Premium Collection', 'premium',         'Luxury fabrics and premium craftsmanship',   'curated',     true, false, 5, 'Premium'),
  ('Limited Edition',    'limited-edition', 'Exclusive limited-run pieces',               'limited',     true, false, 6, 'Limited')
ON CONFLICT (slug) DO NOTHING;
