"use client";

import { useState, useEffect } from "react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { getAdminOrders, updateOrderStatus } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = async (status?: string) => {
    setLoading(true);
    const { orders: o, count } = await getAdminOrders(1, 50, status);
    setOrders(o);
    setTotalCount(count);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    const status = filter === "All" ? undefined : filter.toLowerCase();
    loadOrders(status);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdating(orderId);
    await updateOrderStatus(orderId, status);
    setOrders((p) =>
      p.map((o) =>
        o.id === orderId ? { ...o, status: status as OrderStatus } : o,
      ),
    );
    setUpdating(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} total orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background border border-border rounded-xl mb-5">
        <div className="flex items-center gap-2 p-4 overflow-x-auto scrollbar-hide">
          {[
            "All",
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
          ].map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                activeFilter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">
                        {order.order_number}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">
                        {order.ship_full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.ship_phone}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDate(order.created_at, {
                        year: undefined,
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {order.items?.length ?? 0}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
                          STATUS_COLORS[order.status] ??
                            "bg-gray-100 text-gray-600",
                        )}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                        disabled={updating === order.id}
                        className="text-xs border border-border rounded px-2 py-1 bg-background disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
