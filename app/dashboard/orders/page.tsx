"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { getUserOrders } from "@/app/actions/orders";
import { Loader2 } from "lucide-react";
import type { OrderStatus, Order } from "@/lib/types";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Shipped", color: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-600" },
};

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
            <div
              key={order.id}
              className="bg-background border border-border rounded-xl p-5 hover:shadow-card transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-foreground text-sm">
                      {order.order_number}
                    </p>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                        STATUS_CONFIG[order.status as OrderStatus]?.color ??
                          "bg-gray-100 text-gray-600",
                      )}
                    >
                      {STATUS_CONFIG[order.status as OrderStatus]?.label ??
                        order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)} • {order.items?.length ?? 0}{" "}
                    item{(order.items?.length ?? 0) > 1 ? "s" : ""} •{" "}
                    {order.payment_method.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-base font-bold text-foreground">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
