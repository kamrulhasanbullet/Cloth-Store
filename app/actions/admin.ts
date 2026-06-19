"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { getServerSupabase, getServerUserId } from "@/lib/supabase-server";
import type { Order, Product } from "@/lib/types";

async function requireAdmin(): Promise<string | null> {
  const userId = await getServerUserId();
  if (!userId) return null;

  const sb = await getServerSupabase();
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return profile?.role === "admin" ? userId : null;
}

export async function getAdminStats() {
  const adminId = await requireAdmin();
  if (!adminId) return null;

  const adminClient = getServiceSupabase();

  const [ordersRes, productsRes, revenueRes, usersRes] = await Promise.all([
    adminClient.from("orders").select("id", { count: "exact", head: true }),
    adminClient
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    adminClient.from("orders").select("total"),
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const totalRevenue = (revenueRes.data ?? []).reduce(
    (s: number, o: any) => s + Number(o.total),
    0,
  );

  return {
    totalOrders: ordersRes.count ?? 0,
    totalProducts: productsRes.count ?? 0,
    totalRevenue,
    totalUsers: usersRes.count ?? 0,
  };
}

export async function getAdminRecentOrders(limit = 5) {
  const adminId = await requireAdmin();
  if (!adminId) return [];

  const adminClient = getServiceSupabase();

  const { data, error } = await adminClient
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Order[];
}

export async function getAdminLowStockProducts(threshold = 10, limit = 5) {
  const adminId = await requireAdmin();
  if (!adminId) return [];

  const adminClient = getServiceSupabase();

  const { data, error } = await adminClient
    .from("products")
    .select(
      "id, name, slug, total_stock, base_price, sale_price, images:product_images(url, is_primary)",
    )
    .eq("status", "active")
    .lt("total_stock", threshold)
    .order("total_stock", { ascending: true })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

export async function getAdminOrders(page = 1, perPage = 20, status?: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { orders: [], count: 0 };

  const adminClient = getServiceSupabase();

  let query = adminClient
    .from("orders")
    .select("*, items:order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, count, error } = await query;
  if (error) return { orders: [], count: 0 };
  return { orders: (data ?? []) as Order[], count: count ?? 0 };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const updates: Record<string, any> = { status };

  if (status === "shipped") updates.shipped_at = new Date().toISOString();
  if (status === "delivered") updates.delivered_at = new Date().toISOString();
  if (status === "cancelled") {
    updates.cancelled_at = new Date().toISOString();
    updates.payment_status = "refunded";
  }

  const { error } = await adminClient
    .from("orders")
    .update(updates)
    .eq("id", orderId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function getAdminProducts(page = 1, perPage = 20) {
  const adminId = await requireAdmin();
  if (!adminId) return { products: [], count: 0 };

  const adminClient = getServiceSupabase();

  const from = (page - 1) * perPage;
  const { data, count, error } = await adminClient
    .from("products")
    .select(
      "*, category:categories(name), images:product_images(url, is_primary), variants:product_variants(sku, stock_qty), collections:product_collections(collection:collections(name))",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return { products: [], count: 0 };
  return { products: (data ?? []) as Product[], count: count ?? 0 };
}

export async function updateProduct(
  productId: string,
  updates: Record<string, any>,
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("products")
    .update(updates)
    .eq("id", productId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function deleteProduct(productId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function getAdminCollections(page = 1, perPage = 20) {
  const adminId = await requireAdmin();
  if (!adminId) return { collections: [], count: 0 };

  const adminClient = getServiceSupabase();

  const from = (page - 1) * perPage;
  const { data, count, error } = await adminClient
    .from("collections")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return { collections: [], count: 0 };
  return { collections: data ?? [], count: count ?? 0 };
}

export async function createCollection(data: Record<string, any>) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient.from("collections").insert([data]);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function updateCollection(
  collectionId: string,
  updates: Record<string, any>,
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("collections")
    .update(updates)
    .eq("id", collectionId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function deleteCollection(collectionId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("collections")
    .delete()
    .eq("id", collectionId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function getAdminCustomers(page = 1, perPage = 20) {
  const adminId = await requireAdmin();
  if (!adminId) return { customers: [], count: 0 };

  const adminClient = getServiceSupabase();

  const from = (page - 1) * perPage;
  const { data, count, error } = await adminClient
    .from("profiles")
    .select("id, full_name, phone, avatar_url, created_at, updated_at", {
      count: "exact",
    })
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return { customers: [], count: 0 };
  return { customers: data ?? [], count: count ?? 0 };
}

export async function getAdminCoupons(page = 1, perPage = 20) {
  const adminId = await requireAdmin();
  if (!adminId) return { coupons: [], count: 0 };

  const adminClient = getServiceSupabase();

  const from = (page - 1) * perPage;
  const { data, count, error } = await adminClient
    .from("coupons")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return { coupons: [], count: 0 };
  return { coupons: data ?? [], count: count ?? 0 };
}

export async function createCoupon(data: Record<string, any>) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient.from("coupons").insert([data]);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function updateCoupon(
  couponId: string,
  updates: Record<string, any>,
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("coupons")
    .update(updates)
    .eq("id", couponId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function deleteCoupon(couponId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("coupons")
    .delete()
    .eq("id", couponId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function getAdminReviews(
  page = 1,
  perPage = 20,
  approved?: boolean,
) {
  const adminId = await requireAdmin();
  if (!adminId) return { reviews: [], count: 0 };

  const adminClient = getServiceSupabase();

  let query = adminClient
    .from("reviews")
    .select(
      "*, profile:profiles(full_name, avatar_url), product:products(name, slug)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (approved !== undefined) {
    query = query.eq("is_approved", approved);
  }

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, count, error } = await query;
  if (error) return { reviews: [], count: 0 };
  return { reviews: data ?? [], count: count ?? 0 };
}

export async function updateReview(
  reviewId: string,
  updates: Record<string, any>,
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("reviews")
    .update(updates)
    .eq("id", reviewId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function getAdminBanners(page = 1, perPage = 20) {
  const adminId = await requireAdmin();
  if (!adminId) return { banners: [], count: 0 };

  const adminClient = getServiceSupabase();

  const from = (page - 1) * perPage;
  const { data, count, error } = await adminClient
    .from("banners")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return { banners: [], count: 0 };
  return { banners: data ?? [], count: count ?? 0 };
}

export async function createBanner(data: Record<string, any>) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient.from("banners").insert([data]);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function updateBanner(
  bannerId: string,
  updates: Record<string, any>,
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("banners")
    .update(updates)
    .eq("id", bannerId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function deleteBanner(bannerId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { error } = await adminClient
    .from("banners")
    .delete()
    .eq("id", bannerId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function getFlashSaleProducts(page = 1, perPage = 50) {
  const adminId = await requireAdmin();
  if (!adminId) return { products: [], count: 0 };

  const adminClient = getServiceSupabase();

  const from = (page - 1) * perPage;
  const { data, count, error } = await adminClient
    .from("products")
    .select(
      "id, name, slug, base_price, sale_price, is_flash_sale, flash_sale_ends_at, images:product_images(url, is_primary)",
      { count: "exact" },
    )
    .eq("is_flash_sale", true)
    .order("flash_sale_ends_at", { ascending: true })
    .range(from, from + perPage - 1);

  if (error) return { products: [], count: 0 };
  return { products: data ?? [], count: count ?? 0 };
}

export async function addToFlashSale(
  productId: string,
  expiresAt: string,
  flashSalePrice: number,
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { data: product } = await adminClient
    .from("products")
    .select("sale_price")
    .eq("id", productId)
    .single();

  const { error } = await adminClient
    .from("products")
    .update({
      is_flash_sale: true,
      flash_sale_ends_at: expiresAt,
      flash_sale_original_price: product?.sale_price ?? null,
      sale_price: flashSalePrice,
    })
    .eq("id", productId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function removeFromFlashSale(productId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  const { data: product } = await adminClient
    .from("products")
    .select("flash_sale_original_price")
    .eq("id", productId)
    .single();

  const { error } = await adminClient
    .from("products")
    .update({
      is_flash_sale: false,
      flash_sale_ends_at: null,
      sale_price: product?.flash_sale_original_price ?? null,
      flash_sale_original_price: null,
    })
    .eq("id", productId);

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function getProductsNotInFlashSale(page = 1, perPage = 50) {
  const adminId = await requireAdmin();
  if (!adminId) return { products: [], count: 0 };

  const adminClient = getServiceSupabase();

  const from = (page - 1) * perPage;
  const { data, count, error } = await adminClient
    .from("products")
    .select(
      "id, name, slug, base_price, sale_price, status, images:product_images(url, is_primary)",
      { count: "exact" },
    )
    .eq("status", "active")
    .eq("is_flash_sale", false)
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return { products: [], count: 0 };
  return { products: data ?? [], count: count ?? 0 };
}

export async function createProduct(
  productData: Record<string, any>,
  collectionIds: string[],
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false, id: null };

  const adminClient = getServiceSupabase();

  const { data, error } = await adminClient
    .from("products")
    .insert([productData])
    .select()
    .single();

  if (error) return { error: error.message, success: false, id: null };

  if (collectionIds.length > 0) {
    const rows = collectionIds.map((collection_id) => ({
      product_id: data.id,
      collection_id,
    }));
    await adminClient.from("product_collections").insert(rows);
  }

  return { error: null, success: true, id: data.id };
}

export async function updateProductCollections(
  productId: string,
  collectionIds: string[],
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Unauthorized", success: false };

  const adminClient = getServiceSupabase();

  await adminClient
    .from("product_collections")
    .delete()
    .eq("product_id", productId);

  if (collectionIds.length > 0) {
    const rows = collectionIds.map((collection_id) => ({
      product_id: productId,
      collection_id,
    }));
    await adminClient.from("product_collections").insert(rows);
  }

  return { error: null, success: true };
}
