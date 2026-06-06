"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  getAdminBanners,
  updateBanner,
  deleteBanner,
  createBanner,
} from "@/app/actions/admin";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    cta_text: "",
    cta_url: "",
    image_url: "",
    image_url_mobile: "",
    placement: "hero",
    is_active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const { banners: b, count } = await getAdminBanners(1, 50);
    setBanners(b);
    setTotalCount(count);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBanner(formData);
    setShowForm(false);
    setFormData({
      title: "",
      subtitle: "",
      cta_text: "",
      cta_url: "",
      image_url: "",
      image_url_mobile: "",
      placement: "hero",
      is_active: true,
    });
    loadBanners();
  };

  const handleToggle = async (banner: any) => {
    await updateBanner(banner.id, { is_active: !banner.is_active });
    loadBanners();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await deleteBanner(id);
    loadBanners();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} total banners
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all"
        >
          <Plus size={16} /> New Banner
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-background border border-border rounded-xl p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Create Banner
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Banner title"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Placement
              </label>
              <select
                value={formData.placement}
                onChange={(e) =>
                  setFormData({ ...formData, placement: e.target.value })
                }
                className="input-field"
              >
                <option value="hero">Hero</option>
                <option value="mid">Mid Page</option>
                <option value="footer">Footer</option>
                <option value="popup">Popup</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="Banner subtitle"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                CTA Text
              </label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) =>
                  setFormData({ ...formData, cta_text: e.target.value })
                }
                placeholder="Shop Now"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                CTA URL
              </label>
              <input
                type="text"
                value={formData.cta_url}
                onChange={(e) =>
                  setFormData({ ...formData, cta_url: e.target.value })
                }
                placeholder="/shop"
                className="input-field"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Image URL (Desktop)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://..."
                required
                className="input-field"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Image URL (Mobile)
              </label>
              <input
                type="url"
                value={formData.image_url_mobile}
                onChange={(e) =>
                  setFormData({ ...formData, image_url_mobile: e.target.value })
                }
                placeholder="https://..."
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

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-background border border-border rounded-xl">
            No banners found
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-background border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-start gap-4 p-4">
                {banner.image_url && (
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {banner.title}
                      </p>
                      {banner.subtitle && (
                        <p className="text-sm text-muted-foreground">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground capitalize bg-secondary/30 px-2 py-1 rounded">
                      {banner.placement}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        banner.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(banner)}
                    className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:bg-secondary transition-colors"
                  >
                    {banner.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
