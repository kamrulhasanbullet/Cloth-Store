"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, formatPrice, formatDate, getImageUrl } from "@/lib/utils";
import { getUserOrders } from "@/app/actions/orders";
import { Loader2, Package, ChevronDown, ChevronUp } from "lucide-react";
import type { OrderStatus, Order, OrderItem } from "@/lib/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Shipped", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-600" },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[order.status as OrderStatus] ?? {
    label: order.status,
    color: "bg-gray-100 text-gray-600",
  };

  const firstItem = order.items?.[0];
  const extraCount = (order.items?.length ?? 0) - 1;

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-card transition-shadow">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold text-foreground tracking-wide">
            {order.order_number}
          </p>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full",
              statusCfg.color,
            )}
          >
            {statusCfg.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(order.created_at)}
        </p>
      </div>

      {/* Product preview */}
      <div className="px-5 py-4 flex items-center gap-4">
        {/* First product image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {firstItem?.image_url ? (
            <Image
              src={getImageUrl(firstItem.image_url, 200)}
              alt={firstItem.product_name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={24} className="text-muted-foreground" />
            </div>
          )}
          {extraCount > 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                +{extraCount}
              </span>
            </div>
          )}
        </div>

        {/* Product name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {firstItem?.product_name ?? "Product"}
          </p>
          {firstItem?.size && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {firstItem.color ? `${firstItem.color} • ` : ""}
              Size: {firstItem.size}
            </p>
          )}
          {extraCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              and {extraCount} more item{extraCount > 1 ? "s" : ""}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {order.items?.length ?? 0} item
            {(order.items?.length ?? 0) > 1 ? "s" : ""} •{" "}
            {order.payment_method.toUpperCase()}
          </p>
        </div>

        {/* Price + expand */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="text-base font-bold text-foreground">
            {formatPrice(order.total)}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-accent font-semibold hover:underline"
          >
            {expanded ? (
              <>
                Hide <ChevronUp size={12} />
              </>
            ) : (
              <>
                Details <ChevronDown size={12} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-3 bg-secondary/10">
          {/* All items */}
          {order.items?.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
            </div>
          ))}

          {/* Price breakdown */}
          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.shipping_fee > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
                </span>
                <span className="text-emerald-600">
                  -{formatPrice(order.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery address */}
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Delivery Address
            </p>
            <p className="text-xs text-foreground font-medium">
              {order.ship_full_name} • {order.ship_phone}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.ship_address}, {order.ship_city}, {order.ship_district}
            </p>
          </div>

          {/* Tracking */}
          {order.tracking_number && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                Tracking
              </p>
              <p className="text-xs text-foreground font-mono">
                {order.tracking_number}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserOrders()
      .then(({ orders }) => setOrders(orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage your purchases
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-background border border-border rounded-xl p-12 text-center">
          <Package size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex mt-4 text-sm font-semibold text-accent hover:underline"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
