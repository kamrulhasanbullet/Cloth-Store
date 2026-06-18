"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createProduct } from "@/app/actions/admin";

const COLLECTIONS = [
  { id: "91df8360-bd18-44a4-b8c8-4144c68982f7", name: "Summer Collection" },
  { id: "2567f2e1-78d6-4f11-891e-519fe3e171aa", name: "Winter Collection" },
  { id: "9166298b-329b-4a1f-871d-b71b77ab8020", name: "Eid Collection" },
  { id: "89dc15b8-e7b8-4cb2-b945-87721d4bb1b3", name: "Premium Collection" },
  { id: "aa10df44-c900-45fc-a45f-c2d235f78ee7", name: "Limited Edition" },
  { id: "dbe72a73-8e45-4e07-a9ab-2af7c4620778", name: "New Arrivals" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([
    "dbe72a73-8e45-4e07-a9ab-2af7c4620778",
  ]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    description: "",
    short_desc: "",
    base_price: "",
    sale_price: "",
    cost_price: "",
    sku_prefix: "",
    brand: "",
    material: "",
    care_instructions: "",
    total_stock: "",
    status: "active",
    is_featured: false,
    is_new_arrival: true,
    is_best_seller: false,
  });

  useEffect(() => {
    const loadCategories = async () => {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setCategories(data ?? []);
    };
    loadCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, type, value } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        category_id: formData.category_id || null,
        base_price: parseFloat(formData.base_price) || 0,
        sale_price: formData.sale_price
          ? parseFloat(formData.sale_price)
          : null,
        cost_price: parseFloat(formData.cost_price) || 0,
        total_stock: parseInt(formData.total_stock) || 0,
        is_active: formData.status === "active",
      };

      const result = await createProduct(productData, selectedCollections);
      if (result.success) {
        router.push("/admin/products");
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products">
          <ArrowLeft
            size={20}
            className="text-muted-foreground hover:text-foreground transition-colors"
          />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Create a new product in your catalog
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-background border border-border rounded-xl p-6 max-w-2xl"
      >
        <div className="space-y-5">
          {/* Basic Info */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium Cotton Shirt"
                  required
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="premium-cotton-shirt"
                    required
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  SKU Prefix
                </label>
                <input
                  type="text"
                  name="sku_prefix"
                  value={formData.sku_prefix}
                  onChange={handleChange}
                  placeholder="SHIRT-001"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Short Description
                </label>
                <textarea
                  name="short_desc"
                  value={formData.short_desc}
                  onChange={handleChange}
                  placeholder="Brief description for listings"
                  rows={2}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Full Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed product description"
                  rows={4}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Collections */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Collections
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Product টি যে collections এ থাকবে সেগুলো select করো
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLLECTIONS.map((col) => (
                <label
                  key={col.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-medium ${
                    selectedCollections.includes(col.id)
                      ? "border-foreground bg-foreground/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(col.id)}
                    onChange={() => toggleCollection(col.id)}
                    className="hidden"
                  />
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      selectedCollections.includes(col.id)
                        ? "bg-foreground border-foreground"
                        : "border-border"
                    }`}
                  >
                    {selectedCollections.includes(col.id) && (
                      <svg
                        className="w-2.5 h-2.5 text-background"
                        fill="none"
                        viewBox="0 0 10 10"
                      >
                        <path
                          d="M1.5 5l2.5 2.5 4.5-4.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {col.name}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Pricing */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Pricing
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Base Price (BDT)
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Sale Price (Optional)
                </label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Cost Price (BDT)
                </label>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Product Details */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Product Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Brand name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="e.g. Cotton"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="total_stock"
                  value={formData.total_stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="active">Active - visible to customers</option>
                  <option value="draft">Draft - hidden from customers</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 mt-4">
                Care Instructions
              </label>
              <textarea
                name="care_instructions"
                value={formData.care_instructions}
                onChange={handleChange}
                placeholder="e.g. Machine wash cold"
                rows={2}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {[
                ["is_featured", "Featured product"],
                ["is_new_arrival", "New arrival"],
                ["is_best_seller", "Best seller"],
              ].map(([name, label]) => (
                <label
                  key={name}
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <input
                    type="checkbox"
                    name={name}
                    checked={Boolean(formData[name as keyof typeof formData])}
                    onChange={handleChange}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 text-sm font-semibold border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Product
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
