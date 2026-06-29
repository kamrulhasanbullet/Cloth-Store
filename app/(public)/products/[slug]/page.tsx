import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { ProductCard } from "@/components/product/product-card";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getWishlistProductIds } from "@/app/actions/wishlist";
import { ProductReviews } from "@/components/product/product-reviews";
import { getProductReviews, canUserReview } from "@/app/actions/reviews";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.seo_title || product.name,
    description:
      product.seo_description ||
      product.short_desc ||
      product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.short_desc || "",
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, wishlistProductIds, reviews, userCanReview] =
    await Promise.all([
      getRelatedProducts(product.id, product.category_id),
      getWishlistProductIds(),
      getProductReviews(product.id),
      canUserReview(product.id),
    ]);

  const sortedImages = [...(product.images ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-main py-3">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              href="/shop"
              className="hover:text-foreground transition-colors"
            >
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight size={12} />
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="container-main py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery images={sortedImages} productName={product.name} />
          {/* <ProductInfo product={product} /> */}
          <ProductInfo
            product={product}
            initialWishlisted={wishlistProductIds.includes(product.id)}
          />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="section-title mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  initialWishlisted={wishlistProductIds.includes(p.id)}
                />
              ))}
            </div>
          </section>
        )}

        <div className="container-main pb-16">
          <ProductReviews
            productId={product.id}
            initialReviews={reviews}
            canReview={userCanReview}
            avgRating={product.avg_rating}
            reviewCount={product.review_count}
          />
        </div>
      </div>
    </div>
  );
}
