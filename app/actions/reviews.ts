"use server";

import { getServerSupabase, getServerUserId } from "@/lib/supabase-server";
import type { ApiResponse } from "@/lib/types";

export async function getProductReviews(productId: string) {
  const sb = await getServerSupabase();
  const { data } = await sb
    .from("reviews")
    .select(
      "id, rating, title, body, created_at, is_verified, profile:profiles(full_name, avatar_url)",
    )
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    ...r,
    profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
  }));
}

export async function canUserReview(productId: string): Promise<boolean> {
  const userId = await getServerUserId();
  if (!userId) return false;

  const sb = await getServerSupabase();

  // Check if user has a delivered order with this product
  const { data: order } = await sb
    .from("orders")
    .select("id, items:order_items!inner(product_id)")
    .eq("user_id", userId)
    .eq("status", "delivered")
    .eq("order_items.product_id", productId)
    .maybeSingle();

  if (!order) return false;

  // Check if user has already reviewed this product
  const { data: existing } = await sb
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  return !existing;
}

export async function submitReview(
  productId: string,
  rating: number,
  title: string,
  body: string,
): Promise<ApiResponse> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  // delivered order check
  const { data: order } = await sb
    .from("orders")
    .select("id, items:order_items!inner(product_id)")
    .eq("user_id", userId)
    .eq("status", "delivered")
    .eq("order_items.product_id", productId)
    .maybeSingle();

  if (!order) {
    return {
      data: null,
      error: "You can only review products you have purchased and received",
      success: false,
    };
  }

  // duplicate check
  const { data: existing } = await sb
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    return {
      data: null,
      error: "You have already reviewed this product",
      success: false,
    };
  }

  const { error } = await sb.from("reviews").insert({
    user_id: userId,
    product_id: productId,
    rating,
    title,
    body,
    is_verified: true,
    is_approved: false,
  });

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}
