import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/lib/types";

const FALLBACK_BANNERS = [
  {
    id: "1",
    slug: "summer",
    name: "Summer Collection",
    badge_text: "Summer 2025",
    description: "Light, breathable fabrics for the Bangladeshi summer",
    banner_url:
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "2",
    slug: "eid",
    name: "Eid Collection",
    badge_text: "Eid Special",
    description: "Celebrate in style with our exclusive festive range",
    banner_url:
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "3",
    slug: "premium",
    name: "Premium Collection",
    badge_text: "Premium",
    description: "Luxury fabrics and impeccable craftsmanship",
    banner_url:
      "https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

interface CollectionBannersProps {
  collections?: Collection[];
}

export function CollectionBanners({ collections }: CollectionBannersProps) {
  const items =
    collections && collections.length > 0
      ? collections.slice(0, 3).map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          badge_text: c.badge_text,
          description: c.description,
          banner_url: c.banner_url || FALLBACK_BANNERS[0].banner_url,
        }))
      : FALLBACK_BANNERS;

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-main">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">
              Curated For You
            </p>
            <h2 className="section-title">Collections</h2>
          </div>
          <Link
            href="/collections"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            All Collections
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={`/collections/${item.slug}`}
              className={`group relative overflow-hidden rounded-2xl bg-muted product-card-hover ${i === 0 ? "md:row-span-1" : ""}`}
              style={{ aspectRatio: "3/2" }}
            >
              <Image
                src={item.banner_url}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-600 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="overlay-gradient" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                {item.badge_text && (
                  <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full tracking-wide uppercase w-fit mb-3">
                    {item.badge_text}
                  </span>
                )}
                <h3 className="text-white text-xl font-bold font-serif">
                  {item.name}
                </h3>
                <p className="text-white/70 text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-1 mt-4 text-white text-sm font-semibold group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
