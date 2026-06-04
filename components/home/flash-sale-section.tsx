"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";

function useCountdown(endDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calc = () => {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return timeLeft;
}

interface FlashSaleSectionProps {
  products: Product[];
}

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const saleEnd = new Date(Date.now() + 6 * 3600000);
  const { hours, minutes, seconds } = useCountdown(saleEnd);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (products.length === 0) return null;

  return (
    <section className="section-padding bg-foreground text-background">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-background/60 text-xs uppercase tracking-widest">
                Limited Time
              </p>
              <h2 className="text-background text-2xl md:text-3xl font-bold tracking-tight">
                Flash Sale
              </h2>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            <p className="text-background/60 text-sm hidden sm:block">
              Ends in:
            </p>
            <div className="flex items-center gap-2">
              {[
                { label: "HRS", val: hours },
                { label: "MIN", val: minutes },
                { label: "SEC", val: seconds },
              ].map(({ label, val }, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="bg-background/10 border border-background/20 rounded-lg px-3 py-2 text-center min-w-[52px]">
                    <span className="text-background text-xl font-bold tabular-nums">
                      {pad(val)}
                    </span>
                    <p className="text-background/50 text-[9px] uppercase tracking-widest mt-0.5">
                      {label}
                    </p>
                  </div>
                  {i < 2 && (
                    <span className="text-background/40 font-bold text-lg">
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Link
              href="/shop?sale=true"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="[&_.product-card-hover]:bg-background/5 [&_h3]:text-background [&_p]:text-background/60 [&_.text-foreground]:text-background [&_.text-muted-foreground]:text-background/60"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
