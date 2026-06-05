"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Package, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getAdminProducts, updateProduct } from "@/app/actions/admin";
import type { Product } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-600",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminProducts(1, 50)
      .then(({ products: p, count }) => {
        setProducts(p);
        setTotalCount(count);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku_prefix.toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  const handleArchive = async (productId: string) => {
    await updateProduct(productId, { status: "archived", is_active: false });
    setProducts((p) =>
      p.map((pr) =>
        pr.id === productId
          ? { ...pr, status: "archived", is_active: false }
          : pr,
      ),
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} products
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No products found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {[
                    "Product",
                    "Category",
                    "Price",
                    "Stock",
                    "Status",
                    "Featured",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => {
                  const primaryImg =
                    p.images?.find((img: any) => img.is_primary)?.url ?? "";
                  const totalStock =
                    p.variants?.reduce(
                      (s: number, v: any) => s + v.stock_qty,
                      0,
                    ) ?? p.total_stock;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package
                                size={16}
                                className="text-muted-foreground"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.sku_prefix}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {(p.category as any)?.name ?? ""}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        {p.sale_price ? (
                          <div>
                            <span>{formatPrice(p.sale_price)}</span>
                            <span className="text-xs text-muted-foreground line-through ml-1">
                              {formatPrice(p.base_price)}
                            </span>
                          </div>
                        ) : (
                          formatPrice(p.base_price)
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            totalStock === 0
                              ? "text-destructive"
                              : totalStock <= 5
                                ? "text-amber-600"
                                : "text-emerald-600",
                          )}
                        >
                          {totalStock === 0 ? "Out of Stock" : totalStock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                            STATUS_COLORS[p.status] ??
                              "bg-gray-100 text-gray-600",
                          )}
                        >
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.is_featured ? (
                          <span className="text-xs text-amber-600 font-semibold">
                            Featured
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="text-xs font-semibold text-accent hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleArchive(p.id)}
                            className="text-xs font-semibold text-destructive hover:underline"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
