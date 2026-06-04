import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "Shirts",
    slug: "shirts",
    image:
      "https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=600",
    count: "120+ Styles",
  },
  {
    name: "Pants",
    slug: "pants",
    image:
      "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600",
    count: "80+ Styles",
  },
  {
    name: "T-Shirts",
    slug: "t-shirts",
    image:
      "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600",
    count: "200+ Styles",
  },
  {
    name: "Jerseys",
    slug: "jerseys",
    image:
      "https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=600",
    count: "60+ Styles",
  },
];

export function CategoryGrid() {
  return (
    <section className="section-padding bg-background">
      <div className="container-main">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">
              Browse By
            </p>
            <h2 className="section-title">Shop Categories</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            View All
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-muted product-card-hover"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="overlay-gradient rounded-2xl" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white text-xl font-bold font-serif">
                  {cat.name}
                </h3>
                <p className="text-white/70 text-xs mt-1">{cat.count}</p>
                <div className="flex items-center gap-1 mt-3 text-white/80 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0">
                  Shop Now <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
