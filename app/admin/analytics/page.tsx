"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
} from "lucide-react";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getAdminStats, getAdminRecentOrders } from "@/app/actions/admin";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [s, o] = await Promise.all([
        getAdminStats(),
        getAdminRecentOrders(10),
      ]);
      setStats(s);
      setOrders(o);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const revenueChange = 12.5;
  const ordersChange = 8.3;
  const customersChange = 5.2;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sales and performance overview
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp size={12} /> {revenueChange}%
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(stats?.totalRevenue || 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
        </div>

        <div className="bg-background border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <TrendingUp size={12} /> {ordersChange}%
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalOrders || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
        </div>

        <div className="bg-background border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              <TrendingUp size={12} /> {customersChange}%
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalUsers || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Customers</p>
        </div>

        <div className="bg-background border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-rose-600" />
            </div>
            <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <TrendingUp size={12} /> 3.1%
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalProducts || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Products</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-foreground">Recent Orders</h2>
          <a
            href="/admin/orders"
            className="text-xs font-semibold text-accent hover:underline"
          >
            View All
          </a>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No orders yet
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
                    Amount
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-foreground">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">
                        {order.ship_full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.ship_phone}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(order.created_at, {
                        year: undefined,
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-full",
                          {
                            "bg-amber-100 text-amber-700":
                              order.status === "pending",
                            "bg-blue-100 text-blue-700":
                              order.status === "confirmed" ||
                              order.status === "processing",
                            "bg-cyan-100 text-cyan-700":
                              order.status === "shipped",
                            "bg-emerald-100 text-emerald-700":
                              order.status === "delivered",
                            "bg-red-100 text-red-700":
                              order.status === "cancelled",
                          },
                        )}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-background border border-border rounded-xl p-6">
          <h3 className="font-bold text-foreground mb-4">Revenue Trend</h3>
          <div className="h-48 flex items-center justify-center text-muted-foreground bg-secondary/10 rounded-lg">
            <p className="text-sm">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <h3 className="font-bold text-foreground mb-4">
            Order Status Distribution
          </h3>
          <div className="h-48 flex items-center justify-center text-muted-foreground bg-secondary/10 rounded-lg">
            <p className="text-sm">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
