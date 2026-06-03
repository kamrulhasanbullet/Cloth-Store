import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { ShopPagination } from "@/components/shop/shop-pagination";
import { getCollectionBySlug, getCategories } from "@/lib/catalogue";
import { getProducts } from "@/lib/products";

interface CollectionPageProps {
  params: { slug: string };
  searchParams: { page?: string; sort?: string };
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) return {};
  return {
    title: collection.seo_title || `${collection.name} — ARISTO`,
    description: collection.seo_description || collection.description,
  };
}

export const revalidate = 3600;

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) notFound();

  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const sort = (searchParams.sort ?? "newest") as
    | "newest"
    | "popular"
    | "price_asc"
    | "price_desc"
    | "rating";

  const { data: products, total_pages } = await getProducts({
    collection: params.slug,
    page,
    per_page: 12,
    sort,
  });

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (sort) sp.set("sort", sort);
    sp.set("page", String(p));
    return `/collections/${params.slug}?${sp.toString()}`;
  };

  return (
    <div>
      {/* Collection hero */}
      <div className="relative h-64 md:h-80 bg-foreground overflow-hidden">
        {collection.banner_url ? (
          <Image
            src={collection.banner_url}
            alt={collection.name}
            fill
            className="object-cover opacity-60"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-foreground to-foreground/80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative container-main h-full flex flex-col justify-end pb-10">
          {collection.badge_text && (
            <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-3 w-fit">
              {collection.badge_text}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-white">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-white/70 text-sm md:text-base mt-2 max-w-xl">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-main py-3">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link href="/collections" className="hover:text-foreground">
              Collections
            </Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium">
              {collection.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Products */}
      <div className="section-padding">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground text-sm">
              {products.length} products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                defaultValue={sort}
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
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground mb-4">
                No products in this collection yet.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                Browse All Products <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 4} />
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
    </div>
  );
}
