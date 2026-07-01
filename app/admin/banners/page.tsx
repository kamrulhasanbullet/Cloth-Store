"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2, Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAdminBanners,
  updateBanner,
  deleteBanner,
  createBanner,
} from "@/app/actions/admin";
import { uploadToCloudinary } from "@/app/actions/upload";

const PLACEMENT_OPTIONS = [
  {
    value: "hero",
    label: "Hero Slider",
    hint: "Homepage hero — multiple slides",
  },
  {
    value: "category",
    label: "Category Grid",
    hint: "Shop by category — 4 items",
  },
  {
    value: "mid",
    label: "Promo Callout",
    hint: "Mid-page promo banners — 3 items",
  },
  {
    value: "collection_banner",
    label: "Collection Banners",
    hint: "Homepage collection section — 3 items",
  },
  {
    value: "collections_page",
    label: "Collections Page",
    hint: "All collections grid page",
  },
];

const PLACEMENT_COLORS: Record<string, string> = {
  hero: "bg-purple-100 text-purple-700",
  category: "bg-blue-100 text-blue-700",
  mid: "bg-amber-100 text-amber-700",
  collection_banner: "bg-emerald-100 text-emerald-700",
  collections_page: "bg-cyan-100 text-cyan-700",
};

function ImageUploader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Max 10MB allowed");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadToCloudinary(formData);
    if ("error" in result) {
      setError(result.error);
    } else {
      setPreview(result.url);
      onChange(result.url);
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
        {label}
      </label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl overflow-hidden transition-colors cursor-pointer",
          preview ? "border-border" : "border-border hover:border-accent",
          uploading && "pointer-events-none opacity-60",
        )}
        style={{ aspectRatio: "16/7" }}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="600px"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-sm font-semibold">
                Click to change
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview("");
                onChange("");
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            {uploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Upload size={24} />
            )}
            <p className="text-xs font-medium">
              {uploading ? "Uploading..." : "Click to upload image"}
            </p>
            <p className="text-[10px]">PNG, JPG, WebP — max 10MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  cta_text: "",
  cta_url: "",
  image_url: "",
  image_url_mobile: "",
  placement: "hero",
  badge_text: "",
  is_active: true,
  sort_order: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const { banners: b, count } = await getAdminBanners(1, 100);
    setBanners(b);
    setTotalCount(count);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return;
    setSaving(true);
    await createBanner(formData);
    setShowForm(false);
    setFormData({ ...EMPTY_FORM });
    await loadBanners();
    setSaving(false);
  };

  const handleToggle = async (banner: any) => {
    await updateBanner(banner.id, { is_active: !banner.is_active });
    setBanners((prev) =>
      prev.map((b) =>
        b.id === banner.id ? { ...b, is_active: !banner.is_active } : b,
      ),
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await deleteBanner(id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
    setTotalCount((c) => c - 1);
  };

  const filteredBanners =
    activeFilter === "all"
      ? banners
      : banners.filter((b) => b.placement === activeFilter);

  const selectedPlacement = PLACEMENT_OPTIONS.find(
    (p) => p.value === formData.placement,
  );

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
          onClick={() => {
            setShowForm(!showForm);
            setFormData({ ...EMPTY_FORM });
          }}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all"
        >
          <Plus size={16} /> New Banner
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-background border border-border rounded-xl p-6 mb-6"
        >
          <h3 className="text-sm font-bold text-foreground mb-5">
            Create New Banner
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Placement
                </label>
                <select
                  value={formData.placement}
                  onChange={(e) =>
                    setFormData({ ...formData, placement: e.target.value })
                  }
                  className="input-field"
                >
                  {PLACEMENT_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {selectedPlacement && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPlacement.hint}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Premium Men's Fashion"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="Supporting text"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.badge_text}
                  onChange={(e) =>
                    setFormData({ ...formData, badge_text: e.target.value })
                  }
                  placeholder="e.g. New Season 2025"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
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
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="input-field"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower number = shown first
                </p>
              </div>
            </div>

            {/* Right — Image upload */}
            <div className="space-y-4">
              <ImageUploader
                label="Desktop Image *"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
              <ImageUploader
                label="Mobile Image (optional)"
                value={formData.image_url_mobile}
                onChange={(url) =>
                  setFormData({ ...formData, image_url_mobile: url })
                }
              />
            </div>
          </div>

          {!formData.image_url && (
            <p className="text-xs text-destructive mt-4">
              * Desktop image is required
            </p>
          )}

          <div className="flex gap-3 mt-5 pt-5 border-t border-border">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.image_url}
              className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-md hover:bg-foreground/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Create Banner
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
            activeFilter === "all"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary",
          )}
        >
          All ({banners.length})
        </button>
        {PLACEMENT_OPTIONS.map((p) => {
          const count = banners.filter((b) => b.placement === p.value).length;
          return (
            <button
              key={p.value}
              onClick={() => setActiveFilter(p.value)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                activeFilter === p.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {p.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Banner list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-background border border-border rounded-xl">
            No banners found
          </div>
        ) : (
          filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className="bg-background border border-border rounded-xl overflow-hidden flex items-stretch"
            >
              {/* Thumbnail */}
              <div className="relative w-36 flex-shrink-0 bg-muted">
                {banner.image_url ? (
                  <Image
                    src={banner.image_url}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                        PLACEMENT_COLORS[banner.placement] ??
                          "bg-gray-100 text-gray-600",
                      )}
                    >
                      {PLACEMENT_OPTIONS.find(
                        (p) => p.value === banner.placement,
                      )?.label ?? banner.placement}
                    </span>
                    {banner.sort_order !== undefined && (
                      <span className="text-[10px] text-muted-foreground">
                        Order: {banner.sort_order}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-foreground text-sm truncate">
                    {banner.title}
                  </p>
                  {banner.subtitle && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.cta_url && (
                    <p className="text-xs text-accent mt-1 truncate">
                      → {banner.cta_url}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
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
                  <button
                    onClick={() => handleToggle(banner)}
                    className="px-3 py-1.5 text-xs font-semibold border border-border rounded-md hover:bg-secondary transition-colors whitespace-nowrap"
                  >
                    {banner.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  >
                    <Trash2 size={15} />
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
