import type { Metadata } from "next";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/lib/types";
import { getProducts } from "@/lib/products";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ShopPagination } from "@/components/shop/shop-pagination";
import { getCategories } from "@/lib/catalogue";
import { getWishlistProductIds } from "@/app/actions/wishlist";

export const metadata: Metadata = {
  title: "Shop — All Products",
  description:
    "Browse our complete collection of premium men's fashion — shirts, pants, t-shirts, and jerseys.",
};

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: {
    category?: string;
    collection?: string;
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
    page?: string;
    featured?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);

  const filters: ProductFilters = {
    category: searchParams.category,
    collection: searchParams.collection,
    search: searchParams.search,
    sort: (searchParams.sort as ProductFilters["sort"]) ?? "newest",
    min_price: searchParams.min_price
      ? Number(searchParams.min_price)
      : undefined,
    max_price: searchParams.max_price
      ? Number(searchParams.max_price)
      : undefined,
    // sizes,
    page,
    per_page: 12,
    is_featured: searchParams.featured === "true",
  };

  const [
    { data: products, count, total_pages },
    categories,
    wishlistProductIds,
  ] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getWishlistProductIds(),
  ]);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.collection)
      params.set("collection", searchParams.collection);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    if (searchParams.min_price) params.set("min_price", searchParams.min_price);
    if (searchParams.max_price) params.set("max_price", searchParams.max_price);
    params.set("page", String(p));
    return `/shop?${params.toString()}`;
  };

  const pageTitle = searchParams.category
    ? (categories.find((c) => c.slug === searchParams.category)?.name ?? "Shop")
    : searchParams.search
      ? `Results for "${searchParams.search}"`
      : "All Products";

  return (
    <div className="section-padding">
      <div className="container-main">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {count} {count === 1 ? "product" : "products"} found
          </p>
        </div>

        {/* Search bar */}
        <form method="GET" action="/shop" className="mb-8">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
            {searchParams.category && (
              <input
                type="hidden"
                name="category"
                value={searchParams.category}
              />
            )}
          </div>
        </form>

        <Suspense fallback={null}>
          <div className="flex gap-8">
            <ShopFilters categories={categories} />

            <div className="flex-1 min-w-0">
              {products.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {products.map((p, i) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        priority={i < 4}
                        initialWishlisted={wishlistProductIds.includes(p.id)}
                      />
                    ))}
                  </div>
                  <ShopPagination
                    currentPage={page}
                    totalPages={total_pages}
                    buildPageUrl={buildPageUrl}
                  />
                </>
              )}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
