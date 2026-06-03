import Link from "next/link";
import { cn, formatPrice, formatDate } from "@/lib/utils";

const DEMO_ORDERS = [
  {
    id: "1",
    order_number: "ORD-240603-A1B2",
    customer: "Rafiq Ahmed",
    phone: "01700000001",
    total: 4870,
    status: "processing",
    payment: "cod",
    items: 3,
    created_at: "2025-06-03T10:00:00Z",
  },
  {
    id: "2",
    order_number: "ORD-240603-C3D4",
    customer: "Karim Hassan",
    phone: "01700000002",
    total: 1490,
    status: "confirmed",
    payment: "sslcommerz",
    items: 1,
    created_at: "2025-06-03T09:30:00Z",
  },
  {
    id: "3",
    order_number: "ORD-240603-E5F6",
    customer: "Nasir Uddin",
    phone: "01700000003",
    total: 3380,
    status: "pending",
    payment: "cod",
    items: 2,
    created_at: "2025-06-03T08:15:00Z",
  },
  {
    id: "4",
    order_number: "ORD-240602-G7H8",
    customer: "Fahim Chowdhury",
    phone: "01700000004",
    total: 6920,
    status: "shipped",
    payment: "bkash",
    items: 4,
    created_at: "2025-06-02T16:00:00Z",
  },
  {
    id: "5",
    order_number: "ORD-240601-I9J0",
    customer: "Shakib Rahman",
    phone: "01700000005",
    total: 2200,
    status: "delivered",
    payment: "cod",
    items: 1,
    created_at: "2025-06-01T12:00:00Z",
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {DEMO_ORDERS.length} total orders
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
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                f === "All"
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
              {DEMO_ORDERS.map((order) => (
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
                      {order.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.phone}
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
                    {order.items}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-foreground">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                      {order.payment}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
                        STATUS_COLORS[order.status],
                      )}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
