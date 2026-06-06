"use client";

interface SortSelectProps {
  defaultValue: string;
}

export function SortSelect({ defaultValue }: SortSelectProps) {
  return (
    <select
      defaultValue={defaultValue}
      className="text-sm border border-border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort", e.target.value);
        url.searchParams.set("page", "1");
        window.location.href = url.toString();
      }}
    >
      <option value="newest">Newest</option>
      <option value="popular">Most Popular</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </select>
  );
}
