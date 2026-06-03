import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getActiveCollections } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Collections — ARISTO",
  description:
    "Browse all curated collections — Summer, Winter, Eid, New Arrivals, Premium, and Limited Edition.",
};

export const revalidate = 3600;

const FALLBACK_IMAGES = [
  "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=700",
];

export default async function CollectionsPage() {
  const collections = await getActiveCollections();

  return (
    <div className="section-padding">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">
            Curated Styles
          </p>
          <h1 className="section-title">All Collections</h1>
          <p className="section-subtitle mx-auto">
            From seasonal staples to exclusive limited editions — find your
            perfect style.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col, i) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-muted product-card-hover"
              style={{ aspectRatio: "4/3" }}
            >
              <Image
                src={
                  col.banner_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
                }
                alt={col.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {col.badge_text && (
                  <span className="inline-block bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase mb-3">
                    {col.badge_text}
                  </span>
                )}
                <h2 className="text-white text-xl font-bold font-serif">
                  {col.name}
                </h2>
                {col.description && (
                  <p className="text-white/70 text-sm mt-1 line-clamp-2">
                    {col.description}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0">
                  Explore Collection <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
