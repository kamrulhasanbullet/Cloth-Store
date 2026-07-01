import { HeroBannerClient } from "./hero-banner-client";
import { getBannersByPlacement } from "@/lib/banners";

export async function HeroBanner() {
  const slides = await getBannersByPlacement("hero");
  return <HeroBannerClient slides={slides} />;
}
