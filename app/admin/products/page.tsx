import Link from "next/link";
import { Plus, Search, Package } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const DEMO_PRODUCTS = [
  {
    id: "1",
    name: "Premium Oxford Shirt",
    sku: "SHT-M-WHITE",
    category: "Shirts",
    price: 1490,
    stock: 45,
    status: "active",
    is_featured: true,
  },
  {
    id: "2",
    name: "Slim Fit Chino Pants",
    sku: "PNT-32-NAVY",
    category: "Pants",
    price: 1890,
    stock: 22,
    status: "active",
    is_featured: false,
  },
  {
    id: "3",
    name: "Classic Polo T-Shirt",
    sku: "TSH-L-BLACK",
    category: "T-Shirts",
    price: 790,
    stock: 80,
    status: "active",
    is_featured: true,
  },
  {
    id: "4",
    name: "Sports Jersey (BD)",
    sku: "JRS-XL-GREEN",
    category: "Jerseys",
    price: 950,
    stock: 3,
    status: "active",
    is_featured: false,
  },
  {
    id: "5",
    name: "Eid Panjabi Set",
    sku: "PNJ-M-CREAM",
    category: "Shirts",
    price: 2490,
    stock: 0,
    status: "active",
    is_featured: false,
  },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-600",
};

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {DEMO_PRODUCTS.length} products
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
        <input placeholder="Search products..." className="input-field pl-9" />
      </div>

      {/* Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
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
              {DEMO_PRODUCTS.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                        <Package size={16} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {p.category}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-foreground">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        p.stock === 0
                          ? "text-destructive"
                          : p.stock <= 5
                            ? "text-amber-600"
                            : "text-emerald-600",
                      )}
                    >
                      {p.stock === 0 ? "Out of Stock" : p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        STATUS_COLORS[p.status],
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
                      <span className="text-xs text-muted-foreground">—</span>
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
                      <button className="text-xs font-semibold text-destructive hover:underline">
                        Archive
                      </button>
                    </div>
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
