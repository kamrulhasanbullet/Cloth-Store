"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
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

      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      router.push("/admin/products");
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
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
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
              <div className="grid grid-cols-2 gap-4">
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

          <div className="border-t border-border my-5" />

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

          <div className="border-t border-border my-5" />

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
                placeholder="e.g. Machine wash cold, lay flat to dry"
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
                    checked={Boolean(
                      formData[name as keyof typeof formData],
                    )}
                    onChange={handleChange}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border my-5" />

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
