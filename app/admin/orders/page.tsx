"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn, formatPrice, formatDate, getImageUrl } from "@/lib/utils";
import { getAdminOrders, updateOrderStatus } from "@/app/actions/admin";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

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

const FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function OrderRow({
  order,
  onStatusUpdate,
  updating,
}: {
  order: Order;
  onStatusUpdate: (id: string, status: string) => void;
  updating: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Main row */}
      <tr
        className={cn(
          "hover:bg-secondary/20 transition-colors cursor-pointer",
          expanded && "bg-secondary/10",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Order # */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronUp
                size={14}
                className="text-muted-foreground flex-shrink-0"
              />
            ) : (
              <ChevronDown
                size={14}
                className="text-muted-foreground flex-shrink-0"
              />
            )}
            <div>
              <p className="font-bold text-foreground text-xs">
                {order.order_number}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {formatDate(order.created_at, {
                  year: undefined,
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </td>

        {/* Customer */}
        <td className="px-4 py-3.5">
          <p className="font-semibold text-foreground text-sm">
            {order.ship_full_name}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Phone size={10} />
            {order.ship_phone}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin size={10} />
            {order.ship_city}, {order.ship_district}
          </p>
        </td>

        {/* Products preview */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            {order.items?.slice(0, 3).map((item: OrderItem) => (
              <div
                key={item.id}
                className="relative w-9 h-9 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border"
              >
                {item.image_url ? (
                  <Image
                    src={getImageUrl(item.image_url, 80)}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={12} className="text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {(order.items?.length ?? 0) > 3 && (
              <span className="text-xs text-muted-foreground font-medium">
                +{(order.items?.length ?? 0) - 3}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {order.items?.length ?? 0} item
            {(order.items?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </td>

        {/* Total */}
        <td className="px-4 py-3.5">
          <p className="font-bold text-foreground">
            {formatPrice(order.total)}
          </p>
          <p className="text-xs text-muted-foreground uppercase mt-0.5">
            {order.payment_method}
          </p>
        </td>

        {/* Status badge */}
        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
              STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600",
            )}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </td>

        {/* Action */}
        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <select
              value={order.status}
              onChange={(e) => onStatusUpdate(order.id, e.target.value)}
              disabled={updating === order.id}
              className="text-xs border border-border rounded-md px-2 py-1.5 bg-background disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            {updating === order.id && (
              <Loader2
                size={14}
                className="animate-spin text-muted-foreground"
              />
            )}
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-secondary/5">
          <td colSpan={6} className="px-4 py-0">
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Items */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Order Items
                </p>
                <div className="space-y-2.5">
                  {order.items?.map((item: OrderItem) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-background border border-border rounded-lg p-2.5"
                    >
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.image_url ? (
                          <Image
                            src={getImageUrl(item.image_url, 100)}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package
                              size={16}
                              className="text-muted-foreground"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          SKU: {item.variant_sku || "—"}
                          {item.size ? ` • Size: ${item.size}` : ""}
                          {item.color ? ` • ${item.color}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground flex-shrink-0">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="mt-3 bg-background border border-border rounded-lg p-3 space-y-1.5">
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
                        Discount
                        {order.coupon_code ? ` (${order.coupon_code})` : ""}
                      </span>
                      <span className="text-emerald-600">
                        -{formatPrice(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-1.5">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Customer + Shipping */}
              <div className="space-y-4">
                <div className="bg-background border border-border rounded-lg p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Delivery Address
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {order.ship_full_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.ship_phone}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {order.ship_address}
                    <br />
                    {order.ship_city}, {order.ship_district},{" "}
                    {order.ship_division}
                    {order.ship_postal ? ` - ${order.ship_postal}` : ""}
                  </p>
                </div>

                {order.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                      Customer Note
                    </p>
                    <p className="text-xs text-amber-800">{order.notes}</p>
                  </div>
                )}

                {order.tracking_number && (
                  <div className="bg-background border border-border rounded-lg p-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Tracking Number
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {order.tracking_number}
                    </p>
                  </div>
                )}

                <div className="bg-background border border-border rounded-lg p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Payment
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">
                      {order.payment_method}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        order.payment_status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.payment_status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
    loadOrders(filter === "All" ? undefined : filter.toLowerCase());
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdating(orderId);
    await updateOrderStatus(orderId, status);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: status as OrderStatus } : o,
      ),
    );
    setUpdating(null);
  };

  const filteredOrders = search.trim()
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(search.toLowerCase()) ||
          o.ship_full_name.toLowerCase().includes(search.toLowerCase()) ||
          o.ship_phone.includes(search),
      )
    : orders;

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

      {/* Filters + Search */}
      <div className="bg-background border border-border rounded-xl mb-5">
        <div className="flex items-center gap-2 p-4 overflow-x-auto scrollbar-hide border-b border-border">
          {FILTERS.map((f) => (
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
        <div className="px-4 py-3">
          <div className="relative max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, name, or phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Products
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    updating={updating}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
