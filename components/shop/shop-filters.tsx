"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  cn,
  formatPrice,
  PRODUCT_SIZES_CLOTHING,
  PRODUCT_SIZES_PANTS,
} from "@/lib/utils";
import type { Category } from "@/lib/types";

interface ShopFiltersProps {
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const ALL_SIZES = [...PRODUCT_SIZES_CLOTHING, ...PRODUCT_SIZES_PANTS, "Free"];
const PRICE_RANGES = [
  { label: "Under ৳500", min: 0, max: 500 },
  { label: "৳500 – ৳1,000", min: 500, max: 1000 },
  { label: "৳1,000 – ৳2,000", min: 1000, max: 2000 },
  { label: "৳2,000 – ৳5,000", min: 2000, max: 5000 },
  { label: "Above ৳5,000", min: 5000, max: 99999 },
];

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border pb-5 mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-foreground mb-3"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && children}
    </div>
  );
}

export function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = {
    category: params.get("category") ?? "",
    sort: params.get("sort") ?? "newest",
    min_price: params.get("min_price") ?? "",
    max_price: params.get("max_price") ?? "",
    sizes: params.getAll("size"),
    page: params.get("page") ?? "1",
    search: params.get("search") ?? "",
  };

  const update = (key: string, value: string | string[], remove = false) => {
    const p = new URLSearchParams(params.toString());
    if (remove || !value || (Array.isArray(value) && value.length === 0)) {
      p.delete(key);
    } else if (Array.isArray(value)) {
      p.delete(key);
      value.forEach((v) => p.append(key, v));
    } else {
      p.set(key, value);
    }
    p.set("page", "1");
    router.push(`?${p.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push("/shop");

  const hasFilters = !!(
    current.category ||
    current.min_price ||
    current.max_price ||
    current.sizes.length > 0 ||
    current.search
  );

  const FiltersContent = () => (
    <div>
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-destructive font-medium mb-5 hover:underline"
        >
          <X size={12} /> Clear all filters
        </button>
      )}

      <FilterSection title="Category">
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                value={cat.slug}
                checked={current.category === cat.slug}
                onChange={() =>
                  update(
                    "category",
                    current.category === cat.slug ? "" : cat.slug,
                    current.category === cat.slug,
                  )
                }
                className="w-4 h-4 accent-foreground cursor-pointer"
              />
              <span
                className={cn(
                  "text-sm transition-colors",
                  current.category === cat.slug
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => {
            const active =
              current.min_price === String(r.min) &&
              current.max_price === String(r.max);
            return (
              <label
                key={r.label}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="price"
                  checked={active}
                  onChange={() => {
                    if (active) {
                      update("min_price", "", true);
                      update("max_price", "", true);
                    } else {
                      const p = new URLSearchParams(params.toString());
                      p.set("min_price", String(r.min));
                      p.set("max_price", String(r.max));
                      p.set("page", "1");
                      router.push(`?${p.toString()}`, { scroll: false });
                    }
                  }}
                  className="w-4 h-4 accent-foreground cursor-pointer"
                />
                <span
                  className={cn(
                    "text-sm transition-colors",
                    active
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {r.label}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => {
            const active = current.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => {
                  const newSizes = active
                    ? current.sizes.filter((s) => s !== size)
                    : [...current.sizes, size];
                  update("size", newSizes);
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold border rounded-md transition-all",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Sort By">
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={current.sort === opt.value}
                onChange={() => update("sort", opt.value)}
                className="w-4 h-4 accent-foreground cursor-pointer"
              />
              <span
                className={cn(
                  "text-sm",
                  current.sort === opt.value
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24">
          <h3 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">
            Filters
          </h3>
          <FiltersContent />
        </div>
      </aside>

      {/* Mobile filter button + sheet */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 border border-border rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filters{" "}
          {hasFilters && (
            <span className="bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5 font-bold">
              !
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative ml-auto w-80 bg-background h-full overflow-y-auto p-6 animate-slide-in-right">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                  Filters
                </h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 hover:bg-secondary rounded-md"
                >
                  <X size={18} />
                </button>
              </div>
              <FiltersContent />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
