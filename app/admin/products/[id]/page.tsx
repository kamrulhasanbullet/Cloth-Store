"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { updateProduct } from "@/app/actions/admin";

interface ProductPageProps {
  params: { id: string };
}

export default function EditProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setProduct(data);
        setFormData(data);
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_desc: formData.short_desc,
        base_price: parseFloat(formData.base_price),
        sale_price: formData.sale_price
          ? parseFloat(formData.sale_price)
          : null,
        cost_price: parseFloat(formData.cost_price),
        sku_prefix: formData.sku_prefix,
        brand: formData.brand,
        material: formData.material,
        care_instructions: formData.care_instructions,
        total_stock: parseInt(formData.total_stock),
        status: formData.status,
        is_active: formData.status === "active",
      };

      const result = await updateProduct(params.id, updates);
      if (result.success) {
        router.push("/admin/products");
      }
    } catch (err: any) {
      console.error("Error updating product:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <p className="text-muted-foreground">Product not found</p>
          <Link
            href="/admin/products"
            className="text-accent hover:underline text-sm mt-2 block"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{product.name}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-background border border-border rounded-xl p-6 max-w-2xl"
      >
        <div className="space-y-5">
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
                  value={formData?.name || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData?.slug || ""}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    SKU Prefix
                  </label>
                  <input
                    type="text"
                    name="sku_prefix"
                    value={formData?.sku_prefix || ""}
                    onChange={handleChange}
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
                  value={formData?.short_desc || ""}
                  onChange={handleChange}
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
                  value={formData?.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border my-5" />

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
                  value={formData?.base_price || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Sale Price
                </label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData?.sale_price || ""}
                  onChange={handleChange}
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
                  value={formData?.cost_price || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border my-5" />

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
                  value={formData?.brand || ""}
                  onChange={handleChange}
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
                  value={formData?.material || ""}
                  onChange={handleChange}
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
                  value={formData?.total_stock || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData?.status || "draft"}
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
                value={formData?.care_instructions || ""}
                onChange={handleChange}
                rows={2}
                className="input-field"
              />
            </div>
          </div>

          <div className="border-t border-border my-5" />

          <div className="flex gap-3 justify-end">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 text-sm font-semibold border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
