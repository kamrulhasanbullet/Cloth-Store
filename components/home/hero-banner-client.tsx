"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  badge_text: string;
}

const FALLBACK_SLIDES = [
  {
    id: "1",
    title: "Premium\nMen's Fashion",
    subtitle: "Crafted for the Modern Bangladeshi Gentleman",
    cta_text: "Shop New Arrivals",
    cta_url: "/collections/new-arrivals",
    image_url:
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge_text: "New Season 2025",
  },
  {
    id: "2",
    title: "Eid\nCollection",
    subtitle: "Dress to celebrate — exclusive festive styles",
    cta_text: "Explore Eid Collection",
    cta_url: "/collections/eid",
    image_url:
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge_text: "Eid Special",
  },
  {
    id: "3",
    title: "Summer\nEssentials",
    subtitle: "Light fabrics, bold styles for the Bangladeshi summer",
    cta_text: "Shop Summer Collection",
    cta_url: "/collections/summer",
    image_url:
      "https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=1920",
    badge_text: "Summer 2025",
  },
];

export function HeroBannerClient({ slides }: { slides: Slide[] }) {
  const SLIDES = slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback(
    (index: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setTransitioning(false);
      }, 150);
    },
    [transitioning],
  );

  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(
    () => go((current + 1) % SLIDES.length),
    [current, go, SLIDES.length],
  );

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[70vh] min-h-[520px] max-h-[820px] overflow-hidden bg-foreground">
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={s.image_url}
            alt={s.title.replace("\n", " ")}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
        </div>
      ))}

      <div className="relative h-full container-main flex flex-col justify-center">
        <div
          className={cn(
            "max-w-2xl transition-all duration-500",
            transitioning
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0",
          )}
        >
          {slide.badge_text && (
            <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-5">
              {slide.badge_text}
            </span>
          )}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white whitespace-pre-line leading-tight mb-4">
            {slide.title}
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-md">
            {slide.subtitle}
          </p>
          <div className="flex items-center gap-4">
            {slide.cta_url && (
              <Link
                href={slide.cta_url}
                className="btn-primary bg-white text-foreground hover:bg-white/90 rounded-none px-8 py-3 text-sm tracking-widest uppercase inline-block"
              >
                {slide.cta_text || "Shop Now"}
              </Link>
            )}
            <Link
              href="/shop"
              className="text-white/80 hover:text-white text-sm font-medium tracking-wide border-b border-white/40 hover:border-white pb-0.5 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current
                ? "w-8 bg-white"
                : "w-2 bg-white/40 hover:bg-white/60",
            )}
          />
        ))}
      </div>
    </section>
  );
}
