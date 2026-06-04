import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/hero-banner";
import { FeatureBar } from "@/components/home/feature-bar";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductGridSection } from "@/components/home/product-grid-section";
import { CollectionBanners } from "@/components/home/collection-banners";
import { FlashSaleSection } from "@/components/home/flash-sale-section";
import { PromoCallout } from "@/components/home/promo-callout";
import { TestimonialsSection } from "@/components/home/tastimonials-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { getFeaturedCollections } from "@/lib/catalouge";
import {
  getNewArrivals,
  getBestSellers,
  getFeaturedProducts,
  getFlashSaleProducts,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "ARISTO — Premium Men's Fashion Bangladesh",
  description:
    "Discover premium men's shirts, pants, t-shirts, and jerseys. Modern fashion for the contemporary Bangladeshi man.",
};

export const revalidate = 3600;

export default async function HomePage() {
  const [
    newArrivals,
    bestSellers,
    featuredProducts,
    flashSaleProducts,
    featuredCollections,
  ] = await Promise.allSettled([
    getNewArrivals(8),
    getBestSellers(8),
    getFeaturedProducts(8),
    getFlashSaleProducts(6),
    getFeaturedCollections(),
  ]).then((results) =>
    results.map((r) => (r.status === "fulfilled" ? r.value : [])),
  );

  return (
    <>
      <HeroBanner />
      <FeatureBar />
      <CategoryGrid />

      <ProductGridSection
        label="Just In"
        title="New Arrivals"
        subtitle="Fresh styles added weekly — be the first to wear them."
        products={
          newArrivals as Parameters<typeof ProductGridSection>[0]["products"]
        }
        viewAllHref="/collections/new-arrivals"
      />

      <CollectionBanners
        collections={
          featuredCollections as Parameters<
            typeof CollectionBanners
          >[0]["collections"]
        }
      />

      <ProductGridSection
        label="Customer Favorites"
        title="Best Sellers"
        subtitle="The styles our customers keep coming back for."
        products={
          bestSellers as Parameters<typeof ProductGridSection>[0]["products"]
        }
        viewAllHref="/shop?sort=popular"
        viewAllLabel="See All Best Sellers"
      />

      <PromoCallout />

      <FlashSaleSection
        products={
          flashSaleProducts as Parameters<
            typeof FlashSaleSection
          >[0]["products"]
        }
      />

      <ProductGridSection
        label="Curated"
        title="Featured Products"
        subtitle="Handpicked styles by our styling team."
        products={
          featuredProducts as Parameters<
            typeof ProductGridSection
          >[0]["products"]
        }
        viewAllHref="/shop?featured=true"
      />

      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
