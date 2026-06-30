"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Search,
  X,
  ShoppingBag,
  Wallet,
  MapPin,
  Phone,
  Package,
} from "lucide-react";
import { cn, formatDate, formatPrice, getImageUrl } from "@/lib/utils";
import {
  getAdminCustomers,
  getCustomerDetail,
  toggleCustomerStatus,
} from "@/app/actions/admin";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-sky-100 text-sky-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

function CustomerDrawer({
  userId,
  onClose,
  onStatusChange,
}: {
  userId: string;
  onClose: () => void;
  onStatusChange: (userId: string, isActive: boolean) => void;
}) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getCustomerDetail(userId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [userId]);

  const handleToggle = async () => {
    if (!detail) return;
    setUpdating(true);
    const newStatus = !detail.profile.is_active;
    const result = await toggleCustomerStatus(userId, newStatus);
    if (result.success) {
      setDetail({
        ...detail,
        profile: { ...detail.profile, is_active: newStatus },
      });
      onStatusChange(userId, newStatus);
    }
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background h-full overflow-y-auto shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !detail ? (
          <div className="p-12 text-center text-muted-foreground">
            Customer not found
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Customer Details
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-bold overflow-hidden flex-shrink-0">
                  {detail.profile.avatar_url ? (
                    <img
                      src={detail.profile.avatar_url}
                      alt={detail.profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (detail.profile.full_name || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-foreground">
                    {detail.profile.full_name || "Unnamed"}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone size={12} />
                    {detail.profile.phone || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {formatDate(detail.profile.created_at)}
                  </p>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={updating}
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50",
                    detail.profile.is_active
                      ? "bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700"
                      : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700",
                  )}
                >
                  {updating
                    ? "..."
                    : detail.profile.is_active
                      ? "Active"
                      : "Inactive"}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <ShoppingBag size={16} className="text-accent mx-auto mb-1" />
                  <p className="text-base font-bold text-foreground">
                    {detail.stats.orderCount}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Orders
                  </p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <Wallet size={16} className="text-accent mx-auto mb-1" />
                  <p className="text-base font-bold text-foreground">
                    {formatPrice(detail.stats.totalSpent)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Total Spent
                  </p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <Package size={16} className="text-accent mx-auto mb-1" />
                  <p className="text-base font-bold text-foreground">
                    {formatPrice(detail.stats.avgOrderValue)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Avg Order
                  </p>
                </div>
              </div>

              {/* Addresses */}
              {detail.addresses.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Addresses
                  </p>
                  <div className="space-y-2">
                    {detail.addresses.map((addr: any) => (
                      <div
                        key={addr.id}
                        className="bg-secondary/30 rounded-lg p-3 flex items-start gap-2"
                      >
                        <MapPin
                          size={14}
                          className="text-muted-foreground mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {addr.label} {addr.is_default && "(Default)"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {addr.address_line1}, {addr.city}, {addr.district}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order history */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Order History
                </p>
                {detail.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No orders yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {detail.orders.map((order: any) => (
                      <div
                        key={order.id}
                        className="border border-border rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-foreground">
                            {order.order_number}
                          </p>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              STATUS_COLORS[order.status] ??
                                "bg-gray-100 text-gray-600",
                            )}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at, {
                              year: undefined,
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            • {order.items?.length ?? 0} item
                            {(order.items?.length ?? 0) !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const { customers: c, count } = await getAdminCustomers(1, 50);
    setCustomers(c);
    setTotalCount(count);
    setLoading(false);
  };

  const handleStatusChange = (userId: string, isActive: boolean) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === userId ? { ...c, is_active: isActive } : c)),
    );
  };

  const filteredCustomers = search
    ? customers.filter(
        (c) =>
          (c.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.phone ?? "").includes(search),
      )
    : customers;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} total customers
          </p>
        </div>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="input-field pl-9"
        />
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No customers found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedId(customer.id)}
                    className="hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground overflow-hidden flex-shrink-0">
                          {customer.avatar_url ? (
                            <img
                              src={customer.avatar_url}
                              alt={customer.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (customer.full_name || "U").charAt(0).toUpperCase()
                          )}
                        </div>
                        <p className="font-semibold text-foreground">
                          {customer.full_name || "Unnamed"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {customer.orderCount}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDate(customer.created_at, {
                        year: undefined,
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-full",
                          customer.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600",
                        )}
                      >
                        {customer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId && (
        <CustomerDrawer
          userId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
