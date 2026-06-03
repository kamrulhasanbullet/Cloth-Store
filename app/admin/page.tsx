import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Package,
  Clock,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const STATS = [
  {
    label: "Total Revenue",
    value: "৳4,82,500",
    change: "+12.5%",
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Total Orders",
    value: "324",
    change: "+8.2%",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Total Customers",
    value: "1,847",
    change: "+15.3%",
    icon: Users,
    color: "bg-amber-50 text-amber-600",
  },
  {
    label: "Avg Order Value",
    value: "৳1,490",
    change: "+4.1%",
    icon: TrendingUp,
    color: "bg-rose-50 text-rose-600",
  },
];

const RECENT_ORDERS = [
  {
    id: "ORD-240603-A1B2",
    customer: "Rafiq Ahmed",
    items: 3,
    total: 4870,
    status: "processing",
    time: "10 min ago",
  },
  {
    id: "ORD-240603-C3D4",
    customer: "Karim Hassan",
    items: 1,
    total: 1490,
    status: "confirmed",
    time: "32 min ago",
  },
  {
    id: "ORD-240603-E5F6",
    customer: "Nasir Uddin",
    items: 2,
    total: 3380,
    status: "pending",
    time: "1 hr ago",
  },
  {
    id: "ORD-240602-G7H8",
    customer: "Fahim Chowdhury",
    items: 4,
    total: 6920,
    status: "shipped",
    time: "3 hrs ago",
  },
];

const LOW_STOCK = [
  { name: "Premium Oxford Shirt (M)", stock: 3, sku: "SHT-M-WHITE" },
  { name: "Slim Chino (32, Navy)", stock: 2, sku: "PNT-32-NAVY" },
  { name: "Eid Panjabi (XL)", stock: 4, sku: "PNJ-XL-CREAM" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back — here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-background border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
                  stat.color,
                )}
              >
                <stat.icon size={18} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-background border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-bold text-foreground">Recent Orders</h2>
            <a
              href="/admin/orders"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View All
            </a>
          </div>
          <div className="divide-y divide-border">
            {RECENT_ORDERS.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {order.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.customer} • {order.items} items
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    {formatPrice(order.total)}
                  </p>
                  <div className="flex items-center gap-2 justify-end mt-0.5">
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        STATUS_COLORS[order.status],
                      )}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  <Clock size={11} /> {order.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-background border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-bold text-foreground">Low Stock Alert</h2>
            <a
              href="/admin/products"
              className="text-xs font-semibold text-accent hover:underline"
            >
              Manage
            </a>
          </div>
          <div className="divide-y divide-border">
            {LOW_STOCK.map((item) => (
              <div key={item.sku} className="p-4">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">{item.sku}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Package size={12} className="text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600">
                      Only {item.stock} left
                    </span>
                  </div>
                  <button className="text-xs text-accent hover:underline font-semibold">
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-background border border-border rounded-xl p-5">
        <h2 className="font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add Product", href: "/admin/products/new" },
            { label: "New Collection", href: "/admin/collections/new" },
            { label: "Add Banner", href: "/admin/banners/new" },
            { label: "Create Coupon", href: "/admin/coupons/new" },
            { label: "View All Orders", href: "/admin/orders" },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="px-4 py-2 text-sm font-semibold border border-border rounded-md hover:bg-secondary transition-colors"
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
