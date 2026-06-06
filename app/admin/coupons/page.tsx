"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Copy, Check } from "lucide-react";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import {
  getAdminCoupons,
  updateCoupon,
  deleteCoupon,
  createCoupon,
} from "@/app/actions/admin";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    description: "",
    min_order_amount: "",
    max_discount: "",
    usage_limit: "",
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    const { coupons: c, count } = await getAdminCoupons(1, 50);
    setCoupons(c);
    setTotalCount(count);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseFloat(formData.value),
      description: formData.description,
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_discount: formData.max_discount
        ? parseFloat(formData.max_discount)
        : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      is_active: formData.is_active,
    };

    await createCoupon(newCoupon);
    setShowForm(false);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      description: "",
      min_order_amount: "",
      max_discount: "",
      usage_limit: "",
      is_active: true,
    });
    loadCoupons();
  };

  const handleToggle = async (coupon: any) => {
    await updateCoupon(coupon.id, { is_active: !coupon.is_active });
    loadCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await deleteCoupon(id);
    loadCoupons();
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} total coupons
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-background border border-border rounded-xl p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Create Coupon
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="SUMMER2024"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (BDT)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Value
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="10"
                step="0.01"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Min Order Amount
              </label>
              <input
                type="number"
                value={formData.min_order_amount}
                onChange={(e) =>
                  setFormData({ ...formData, min_order_amount: e.target.value })
                }
                placeholder="0"
                step="0.01"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Max Discount (Optional)
              </label>
              <input
                type="number"
                value={formData.max_discount}
                onChange={(e) =>
                  setFormData({ ...formData, max_discount: e.target.value })
                }
                placeholder="0"
                step="0.01"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Usage Limit (Optional)
              </label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: e.target.value })
                }
                placeholder="Unlimited"
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No coupons found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Value
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Min Order
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-foreground">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyCouponCode(coupon.code)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copied === coupon.code ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : formatPrice(coupon.value)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatPrice(coupon.min_order_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {coupon.usage_count} / {coupon.usage_limit || "∞"}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggle(coupon)}
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-full",
                          coupon.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600",
                        )}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-xs font-semibold text-destructive hover:underline"
                      >
                        Delete
                      </button>
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
