"use server";

import { getServerSupabase, getServerUserId } from "@/lib/supabase-server";
import type { ApiResponse, WishlistItem } from "@/lib/types";

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const userId = await getServerUserId();
  if (!userId) return [];

  const sb = await getServerSupabase();

  const { data, error } = await sb
    .from("wishlists")
    .select(
      `
      *,
      product:products(
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as WishlistItem[];
}

export async function toggleWishlist(
  productId: string,
): Promise<ApiResponse<{ inWishlist: boolean }>> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  const { data: existing } = await sb
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await sb.from("wishlists").delete().eq("id", existing.id);
    if (error) return { data: null, error: error.message, success: false };
    return { data: { inWishlist: false }, error: null, success: true };
  }

  const { error } = await sb
    .from("wishlists")
    .insert({ user_id: userId, product_id: productId });
  if (error) return { data: null, error: error.message, success: false };
  return { data: { inWishlist: true }, error: null, success: true };
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const userId = await getServerUserId();
  if (!userId) return false;

  const sb = await getServerSupabase();

  const { data } = await sb
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  return !!data;
}

export async function getWishlistProductIds(): Promise<string[]> {
  const userId = await getServerUserId();
  if (!userId) return [];

  const sb = await getServerSupabase();
  const { data } = await sb
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId);

  return (data ?? []).map((w) => w.product_id);
}
