"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { getServerSupabase, getServerUserId } from "@/lib/supabase-server";
import type { ApiResponse } from "@/lib/types";

export async function getCartWithItems() {
  const userId = await getServerUserId();
  if (!userId) return { items: [], discount: 0, coupon_code: "" };

  const sb = await getServerSupabase();

  const { data: cart } = await sb
    .from("carts")
    .select("id, discount, coupon_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error } = await sb
      .from("carts")
      .insert({ user_id: userId })
      .select("id, discount, coupon_code")
      .single();
    if (error) return { items: [], discount: 0, coupon_code: "" };
    return { items: [], discount: 0, coupon_code: "" };
  }

  const { data: items, error } = await sb
    .from("cart_items")
    .select(
      `
      *,
      product:products(id, name, slug, base_price, sale_price),
      variant:product_variants(id, sku, size, color, color_hex, price, sale_price, stock_qty)
    `,
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (error)
    return {
      items: [],
      discount: cart.discount ?? 0,
      coupon_code: cart.coupon_code ?? "",
    };

  // Get primary images for cart items
  const productIds = (items ?? []).map((i: any) => i.product_id);
  const { data: images } = await sb
    .from("product_images")
    .select("product_id, url, is_primary")
    .in("product_id", productIds)
    .eq("is_primary", true);

  const imageMap = new Map(
    (images ?? []).map((img: any) => [img.product_id, img.url]),
  );

  const enrichedItems = (items ?? []).map((item: any) => ({
    ...item,
    product_name: item.product?.name ?? "",
    product_slug: item.product?.slug ?? "",
    image_url: imageMap.get(item.product_id) ?? "",
    variant_sku: item.variant?.sku ?? "",
    size: item.variant?.size ?? "",
    color: item.variant?.color ?? "",
    color_hex: item.variant?.color_hex ?? "",
    stock_qty: item.variant?.stock_qty ?? 0,
  }));

  return {
    items: enrichedItems,
    discount: cart.discount ?? 0,
    coupon_code: cart.coupon_code ?? "",
  };
}

export async function addToCart(
  productId: string,
  variantId: string | null,
  quantity: number = 1,
): Promise<ApiResponse> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  let { data: cart } = await sb
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error } = await sb
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    if (error) return { data: null, error: error.message, success: false };
    cart = newCart;
  }

  let unitPrice = 0;

  if (variantId) {
    const { data: variant } = await sb
      .from("product_variants")
      .select("price, sale_price, stock_qty")
      .eq("id", variantId)
      .maybeSingle();

    if (!variant)
      return { data: null, error: "Variant not found", success: false };
    if (variant.stock_qty < quantity)
      return { data: null, error: "Insufficient stock", success: false };

    const { data: product } = await sb
      .from("products")
      .select("base_price, sale_price")
      .eq("id", productId)
      .maybeSingle();

    unitPrice = product?.sale_price ?? product?.base_price ?? variant.price;
  } else {
    const { data: product } = await sb
      .from("products")
      .select("base_price, sale_price, total_stock")
      .eq("id", productId)
      .maybeSingle();

    if (!product)
      return { data: null, error: "Product not found", success: false };
    if (product.total_stock < quantity)
      return { data: null, error: "Insufficient stock", success: false };

    unitPrice = product.sale_price ?? product.base_price;
  }

  const conflictCol = variantId ? "cart_id,variant_id" : "cart_id,product_id";

  const { error } = await sb.from("cart_items").upsert(
    {
      cart_id: cart.id,
      product_id: productId,
      variant_id: variantId ?? null,
      quantity,
      unit_price: unitPrice,
    },
    { onConflict: conflictCol },
  );

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<ApiResponse> {
  if (quantity < 1)
    return { data: null, error: "Invalid quantity", success: false };

  const sb = await getServerSupabase();
  const { error } = await sb
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId);

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}

export async function removeCartItem(cartItemId: string): Promise<ApiResponse> {
  const sb = await getServerSupabase();
  const { error } = await sb.from("cart_items").delete().eq("id", cartItemId);

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}

export async function applyCoupon(
  code: string,
): Promise<ApiResponse<{ discount: number }>> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  const { data: coupon, error: couponErr } = await sb
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (couponErr || !coupon)
    return { data: null, error: "Invalid coupon code", success: false };

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { data: null, error: "Coupon has expired", success: false };
  }
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { data: null, error: "Coupon usage limit reached", success: false };
  }

  if (coupon.per_user_limit) {
    const { count } = await sb
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("coupon_code", code.toUpperCase());

    if ((count ?? 0) >= coupon.per_user_limit) {
      return {
        data: null,
        error: "You have already used this coupon",
        success: false,
      };
    }
  }

  const { data: cart } = await sb
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!cart) return { data: null, error: "Cart not found", success: false };

  const { data: items } = await sb
    .from("cart_items")
    .select("unit_price, quantity")
    .eq("cart_id", cart.id);

  const subtotal = (items ?? []).reduce(
    (s: number, i: any) => s + i.unit_price * i.quantity,
    0,
  );

  if (subtotal < coupon.min_order_amount) {
    return {
      data: null,
      error: `Minimum order amount is ৳${coupon.min_order_amount}`,
      success: false,
    };
  }

  let discount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.max_discount && discount > coupon.max_discount) {
    discount = coupon.max_discount;
  }

  const { error: updateErr } = await sb
    .from("carts")
    .update({ coupon_code: code.toUpperCase(), discount })
    .eq("id", cart.id);

  if (updateErr)
    return { data: null, error: updateErr.message, success: false };
  return { data: { discount }, error: null, success: true };
}

export async function removeCoupon(): Promise<ApiResponse> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const sb = await getServerSupabase();

  const { error } = await sb
    .from("carts")
    .update({ coupon_code: "", discount: 0 })
    .eq("user_id", userId);

  if (error) return { data: null, error: error.message, success: false };
  return { data: null, error: null, success: true };
}
