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
      "*, category:categories(name), images:product_images(url, is_primary), variants:product_variants(sku, stock_qty)",
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
