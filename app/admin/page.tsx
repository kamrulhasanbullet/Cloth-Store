"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Loader2,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  getAdminStats,
  getAdminRecentOrders,
  getAdminLowStockProducts,
} from "@/app/actions/admin";

interface StatData {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  totalUsers: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: { length: number };
  ship_full_name: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  total_stock: number;
  images: { url: string; is_primary: boolean }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getAdminRecentOrders(4),
      getAdminLowStockProducts(10, 3),
    ])
      .then(([s, o, l]) => {
        if (s) setStats(s);
        setRecentOrders(o as RecentOrder[]);
        setLowStock(l as LowStockProduct[]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const STATS_ITEMS = [
    {
      label: "Total Revenue",
      value: stats ? formatPrice(stats.totalRevenue) : "--",
      change: "",
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders?.toString() ?? "0",
      change: "",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Customers",
      value: stats?.totalUsers?.toString() ?? "0",
      change: "",
      icon: Users,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Products",
      value: stats?.totalProducts?.toString() ?? "0",
      change: "",
      icon: TrendingUp,
      color: "bg-rose-50 text-rose-600",
    },
  ];

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
        {STATS_ITEMS.map((stat) => (
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
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No orders yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.ship_full_name} • {order.items?.length ?? 0} items
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
                          STATUS_COLORS[order.status] ??
                            "bg-gray-100 text-gray-600",
                        )}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          {lowStock.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              All products well-stocked
            </div>
          ) : (
            <div className="divide-y divide-border">
              {lowStock.map((item) => (
                <div key={item.id} className="p-4">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Package size={12} className="text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600">
                        Only {item.total_stock} left
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
