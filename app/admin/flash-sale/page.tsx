"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Plus, Zap, Clock } from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import {
  getFlashSaleProducts,
  removeFromFlashSale,
  getProductsNotInFlashSale,
  addToFlashSale,
} from "@/app/actions/admin";

export default function AdminFlashSalesPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("00:00");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === "active") {
      const { products } = await getFlashSaleProducts(1, 50);
      setFlashSaleProducts(products);
    } else {
      const { products } = await getProductsNotInFlashSale(1, 50);
      setAvailableProducts(products);
    }
    setLoading(false);
  };

  const handleRemoveFlashSale = async (productId: string) => {
    if (!confirm("Remove this product from flash sale?")) return;
    await removeFromFlashSale(productId);
    loadData();
  };

  const handleAddFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !expiryDate) return;

    const expiresAtDateTime = new Date(
      `${expiryDate}T${expiryTime}`,
    ).toISOString();

    await addToFlashSale(selectedProduct, expiresAtDateTime);
    setShowAddModal(false);
    setSelectedProduct(null);
    setExpiryDate("");
    setExpiryTime("00:00");
    loadData();
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const timeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Flash Sales</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage time-limited promotional sales
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all"
        >
          <Plus size={16} /> Add to Flash Sale
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-background border border-border rounded-xl mb-5">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          {["Active", "Available"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                activeTab === tab.toLowerCase()
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Flash Sales List */}
      {activeTab === "active" && (
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : flashSaleProducts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-background border border-border rounded-xl">
              No active flash sales
            </div>
          ) : (
            flashSaleProducts.map((product) => {
              const expired = isExpired(product.flash_sale_ends_at);
              const primaryImg = product.images?.find(
                (img: any) => img.is_primary,
              )?.url;

              return (
                <div
                  key={product.id}
                  className={cn(
                    "bg-background border rounded-xl overflow-hidden transition-all",
                    expired
                      ? "border-red-200 bg-red-50/20"
                      : "border-border hover:border-amber-300",
                  )}
                >
                  <div className="flex items-start gap-4 p-4">
                    {primaryImg && (
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                        <img
                          src={primaryImg}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-sm font-bold text-amber-600">
                              {formatPrice(
                                product.sale_price || product.base_price,
                              )}
                            </span>
                            {product.base_price !== product.sale_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.base_price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={cn(
                            "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
                            expired
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          <Zap size={12} />
                          {expired ? "Expired" : "Active"}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded-full">
                          <Clock size={12} />
                          {timeRemaining(product.flash_sale_ends_at)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Ends{" "}
                          {formatDate(product.flash_sale_ends_at, {
                            year: undefined,
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFlashSale(product.id)}
                      className="px-3 py-2 text-xs font-semibold text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Available Products */}
      {activeTab === "available" && (
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No products available for flash sale
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {availableProducts.map((product) => {
                    const primaryImg = product.images?.find(
                      (img: any) => img.is_primary,
                    )?.url;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-secondary/20 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {primaryImg && (
                              <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden">
                                <img
                                  src={primaryImg}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-foreground">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-foreground">
                          {formatPrice(product.base_price)}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setShowAddModal(true);
                            }}
                            className="text-xs font-semibold text-accent hover:underline"
                          >
                            Add Sale
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add to Flash Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Add to Flash Sale
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedProduct(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFlashSale} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Select Product
                </label>
                <select
                  value={selectedProduct || ""}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Choose a product...</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatPrice(product.base_price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Expiry Time
                </label>
                <input
                  type="time"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 text-sm font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center justify-center gap-2"
                >
                  <Zap size={14} /> Add to Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
