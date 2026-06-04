import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/product/product-card";
import { SectionHeader } from "@/components/ui/section-header";
import type { Product } from "@/lib/types";

interface ProductGridSectionProps {
  label: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  viewAllLabel?: string;
  isLoading?: boolean;
}

export function ProductGridSection({
  label,
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = "View All",
  isLoading = false,
}: ProductGridSectionProps) {
  return (
    <section className="section-padding">
      <div className="container-main">
        <SectionHeader
          label={label}
          title={title}
          subtitle={subtitle}
          action={
            <Link
              href={viewAllHref}
              className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors group"
            >
              {viewAllLabel}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
