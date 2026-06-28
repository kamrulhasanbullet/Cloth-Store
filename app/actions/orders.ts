"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { getServerSupabase, getServerUserId } from "@/lib/supabase-server";
import type {
  ApiResponse,
  Order,
  OrderItem,
  CheckoutFormData,
} from "@/lib/types";

export async function getUserOrders(page = 1, perPage = 10) {
  const userId = await getServerUserId();
  if (!userId) return { orders: [], count: 0 };

  const sb = await getServerSupabase();

  const from = (page - 1) * perPage;
  const { data, count, error } = await sb
    .from("orders")
    .select("*, items:order_items(*)", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return { orders: [], count: 0 };
  return { orders: (data ?? []) as Order[], count: count ?? 0 };
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const userId = await getServerUserId();
  if (!userId) return null;

  const sb = await getServerSupabase();

  const { data, error } = await sb
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return data as Order | null;
}

export async function createOrder(
  formData: CheckoutFormData,
): Promise<ApiResponse<{ orderId: string; orderNumber: string }>> {
  const userId = await getServerUserId();
  if (!userId)
    return { data: null, error: "Not authenticated", success: false };

  const adminClient = getServiceSupabase();
  const sb = await getServerSupabase();

  // Get cart
  const { data: cart } = await sb
    .from("carts")
    .select("id, discount, coupon_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (!cart) return { data: null, error: "Cart is empty", success: false };

  const { data: cartItems } = await adminClient
    .from("cart_items")
    .select(
      "*, product:products(name, slug), variant:product_variants(sku, size, color)",
    )
    .eq("cart_id", cart.id);

  if (!cartItems || cartItems.length === 0) {
    return { data: null, error: "Cart is empty", success: false };
  }

  // Validate stock for all items
  for (const item of cartItems) {
    const { data: variant } = await adminClient
      .from("product_variants")
      .select("stock_qty")
      .eq("id", item.variant_id)
      .maybeSingle();

    if (!variant || variant.stock_qty < item.quantity) {
      return {
        data: null,
        error: `Insufficient stock for ${item.product?.name ?? "item"}`,
        success: false,
      };
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (s: number, i: any) => s + i.unit_price * i.quantity,
    0,
  );
  const shippingFee = subtotal >= 1500 ? 0 : 80;
  const discount = cart.discount ?? 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee - discount + tax;

  // Generate order number
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Get primary images for items
  const productIds = cartItems.map((i: any) => i.product_id);
  const { data: images } = await adminClient
    .from("product_images")
    .select("product_id, url")
    .in("product_id", productIds)
    .eq("is_primary", true);

  const imageMap = new Map(
    (images ?? []).map((img: any) => [img.product_id, img.url]),
  );

  // Create order
  const { data: order, error: orderErr } = await adminClient
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: userId,
      status: "pending",
      payment_status: formData.payment_method === "cod" ? "unpaid" : "pending",
      payment_method: formData.payment_method,
      ship_full_name: formData.full_name,
      ship_phone: formData.phone,
      ship_address:
        formData.address_line1 +
        (formData.address_line2 ? ", " + formData.address_line2 : ""),
      ship_city: formData.city,
      ship_district: formData.district,
      ship_division: formData.division,
      ship_postal: formData.postal_code ?? "",
      subtotal,
      shipping_fee: shippingFee,
      discount,
      tax,
      total,
      coupon_code: cart.coupon_code ?? "",
      notes: formData.notes ?? "",
    })
    .select("id, order_number")
    .single();

  if (orderErr) return { data: null, error: orderErr.message, success: false };

  // Create order items with snapshot data
  const orderItems = cartItems.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product?.name ?? "",
    variant_sku: item.variant?.sku ?? "",
    size: item.variant?.size ?? "",
    color: item.variant?.color ?? "",
    image_url: imageMap.get(item.product_id) ?? "",
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.unit_price * item.quantity,
  }));

  const { error: itemsErr } = await adminClient
    .from("order_items")
    .insert(orderItems);

  if (itemsErr) return { data: null, error: itemsErr.message, success: false };

  // Decrement stock for each variant
  for (const item of cartItems) {
    const { data: v } = await adminClient
      .from("product_variants")
      .select("stock_qty")
      .eq("id", item.variant_id)
      .maybeSingle();
    if (v) {
      await adminClient
        .from("product_variants")
        .update({ stock_qty: Math.max(0, v.stock_qty - item.quantity) })
        .eq("id", item.variant_id);
    }
  }

  // Update total_sold for each product
  const soldMap = new Map<string, number>();
  for (const item of cartItems) {
    soldMap.set(
      item.product_id,
      (soldMap.get(item.product_id) ?? 0) + item.quantity,
    );
  }
  const soldEntries = Array.from(soldMap.entries());
  for (let i = 0; i < soldEntries.length; i++) {
    const [productId, qty] = soldEntries[i];
    const { data: p } = await adminClient
      .from("products")
      .select("total_sold")
      .eq("id", productId)
      .maybeSingle();
    if (p) {
      await adminClient
        .from("products")
        .update({ total_sold: p.total_sold + qty })
        .eq("id", productId);
    }
  }

  // Create payment record for COD
  if (formData.payment_method === "cod") {
    await adminClient.from("payments").insert({
      order_id: order.id,
      user_id: userId,
      method: "cod",
      status: "pending",
      amount: total,
      currency: "BDT",
    });
  }

  // Save address if requested
  if (formData.save_address) {
    await adminClient.from("addresses").insert({
      user_id: userId,
      full_name: formData.full_name,
      phone: formData.phone,
      address_line1: formData.address_line1,
      address_line2: formData.address_line2 ?? "",
      city: formData.city,
      district: formData.district,
      division: formData.division,
      postal_code: formData.postal_code ?? "",
      is_default: false,
      label: "Home",
    });
  }

  if (cart.coupon_code) {
    const { data: coupon } = await adminClient
      .from("coupons")
      .select("id, usage_count, usage_limit")
      .eq("code", cart.coupon_code)
      .maybeSingle();

    if (coupon) {
      await adminClient
        .from("coupons")
        .update({ usage_count: coupon.usage_count + 1 })
        .eq("id", coupon.id);
    }
  }

  // Clear cart
  await adminClient.from("cart_items").delete().eq("cart_id", cart.id);
  await adminClient
    .from("carts")
    .update({ discount: 0, coupon_code: "" })
    .eq("id", cart.id);

  // Create notification
  await adminClient.from("notifications").insert({
    user_id: userId,
    type: "order",
    title: "Order Placed",
    body: `Your order ${orderNumber} has been placed successfully.`,
    link: "/dashboard/orders",
  });

  return {
    data: { orderId: order.id, orderNumber: order.order_number },
    error: null,
    success: true,
  };
}
