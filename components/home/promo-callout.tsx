import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function PromoCallout() {
  return (
    <section className="section-padding">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left — Large banner */}
          <Link
            href="/collections/new-arrivals"
            className="group relative overflow-hidden rounded-2xl bg-muted"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              src="https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="New Arrivals"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="badge-new mb-3 inline-block">Just Dropped</span>
              <h3 className="text-white text-3xl font-bold font-serif mb-2">
                New Arrivals
              </h3>
              <p className="text-white/70 text-sm mb-5">
                Fresh styles added weekly
              </p>
              <div className="flex items-center gap-2 text-white text-sm font-semibold group-hover:gap-3 transition-all">
                Shop Now <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Right — Two smaller banners */}
          <div className="flex flex-col gap-5">
            <Link
              href="/collections/premium"
              className="group relative overflow-hidden rounded-2xl bg-muted flex-1"
              style={{ minHeight: "200px" }}
            >
              <Image
                src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=700"
                alt="Premium Collection"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-7">
                <span className="badge-limited mb-2 inline-block w-fit">
                  Premium
                </span>
                <h3 className="text-white text-2xl font-bold font-serif">
                  Premium Collection
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Luxury meets craftsmanship
                </p>
              </div>
            </Link>
            <Link
              href="/collections/limited-edition"
              className="group relative overflow-hidden rounded-2xl bg-muted flex-1"
              style={{ minHeight: "200px" }}
            >
              <Image
                src="https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=700"
                alt="Limited Edition"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-7">
                <span className="badge-sale mb-2 inline-block w-fit">
                  Limited
                </span>
                <h3 className="text-white text-2xl font-bold font-serif">
                  Limited Edition
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Exclusive. Rare. Yours.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
