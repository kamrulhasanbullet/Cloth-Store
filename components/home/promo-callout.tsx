import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getBannersByPlacement } from "@/lib/banners";

const FALLBACK = [
  {
    id: "1",
    title: "New Arrivals",
    subtitle: "Fresh styles added weekly",
    badge_text: "Just Dropped",
    cta_text: "Shop Now",
    cta_url: "/collections/new-arrivals",
    image_url:
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "2",
    title: "Premium Collection",
    subtitle: "Luxury meets craftsmanship",
    badge_text: "Premium",
    cta_text: "Explore",
    cta_url: "/collections/premium",
    image_url:
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "3",
    title: "Limited Edition",
    subtitle: "Exclusive. Rare. Yours.",
    badge_text: "Limited",
    cta_text: "Shop",
    cta_url: "/collections/limited-edition",
    image_url:
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
];

export async function PromoCallout() {
  const banners = await getBannersByPlacement("mid");
  const items = banners.length >= 3 ? banners : FALLBACK;
  const [main, ...rest] = items;

  return (
    <section className="section-padding">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left — Large banner */}
          <Link
            href={main.cta_url || "/shop"}
            className="group relative overflow-hidden rounded-2xl bg-muted"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              src={main.image_url}
              alt={main.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              {main.badge_text && (
                <span className="badge-new mb-3 inline-block">
                  {main.badge_text}
                </span>
              )}
              <h3 className="text-white text-3xl font-bold font-serif mb-2">
                {main.title}
              </h3>
              {main.subtitle && (
                <p className="text-white/70 text-sm mb-5">{main.subtitle}</p>
              )}
              <div className="flex items-center gap-2 text-white text-sm font-semibold group-hover:gap-3 transition-all">
                {main.cta_text || "Shop Now"} <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Right — Two smaller banners */}
          <div className="flex flex-col gap-5">
            {rest.slice(0, 2).map((item: any) => (
              <Link
                key={item.id}
                href={item.cta_url || "/shop"}
                className="group relative overflow-hidden rounded-2xl bg-muted flex-1"
                style={{ minHeight: "200px" }}
              >
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center p-7">
                  {item.badge_text && (
                    <span className="badge-limited mb-2 inline-block w-fit">
                      {item.badge_text}
                    </span>
                  )}
                  <h3 className="text-white text-2xl font-bold font-serif">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-white/70 text-sm mt-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
