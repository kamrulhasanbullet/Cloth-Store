import Link from "next/link";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const DEMO_ORDERS = [
  {
    id: "1",
    order_number: "ORD-240103-A1B2",
    status: "delivered" as OrderStatus,
    total: 4870,
    created_at: "2025-01-03T10:00:00Z",
    items: 3,
    payment_method: "cod",
  },
  {
    id: "2",
    order_number: "ORD-240215-C3D4",
    status: "shipped" as OrderStatus,
    total: 2980,
    created_at: "2025-02-15T14:30:00Z",
    items: 2,
    payment_method: "sslcommerz",
  },
  {
    id: "3",
    order_number: "ORD-240320-E5F6",
    status: "processing" as OrderStatus,
    total: 1890,
    created_at: "2025-03-20T09:15:00Z",
    items: 1,
    payment_method: "cod",
  },
];

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
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage your purchases
        </p>
      </div>

      {DEMO_ORDERS.length === 0 ? (
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
          {DEMO_ORDERS.map((order) => (
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
                        STATUS_CONFIG[order.status].color,
                      )}
                    >
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)} • {order.items} item
                    {order.items > 1 ? "s" : ""} •{" "}
                    {order.payment_method.toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-base font-bold text-foreground">
                    {formatPrice(order.total)}
                  </p>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
