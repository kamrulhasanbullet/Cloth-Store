"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Eye, X, Loader2 } from "lucide-react";
import {
  cn,
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getImageUrl,
  truncate,
} from "@/lib/utils";
import type { Product } from "@/lib/types";
import { toggleWishlist } from "@/app/actions/wishlist";
import { addToCart } from "@/app/actions/cart";
import { useCart } from "@/components/cart/cart-provider";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  initialWishlisted?: boolean;
  darkMode?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
  initialWishlisted = false,
  darkMode = false,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { refreshCart, refreshWishlist } = useCart();

  const primaryImage =
    product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const hoverImage = product.images?.[1];
  const effectivePrice = getEffectivePrice(
    product.base_price,
    product.sale_price,
  );
  const discountPct = getDiscountPercent(product.base_price, effectivePrice);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const totalStock = hasVariants
    ? product.variants!.reduce((sum, v) => sum + (v.stock_qty ?? 0), 0)
    : product.total_stock;
  const isOutOfStock = totalStock === 0;

  const badgeText = product.is_flash_sale
    ? "Flash Sale"
    : product.is_new_arrival
      ? "New"
      : discountPct > 0
        ? `-${discountPct}%`
        : null;

  const badgeClass = product.is_flash_sale
    ? "bg-red-500 text-white"
    : product.is_new_arrival
      ? "bg-emerald-500 text-white"
      : "bg-amber-500 text-white";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants) {
      setShowSizePopup(true);
    } else {
      handleAddToCart(null);
    }
  };

  const handleAddToCart = async (variantId: string | null) => {
    setAdding(true);
    try {
      const result = await addToCart(product.id, variantId, 1);
      if (result.success) {
        setAdded(true);
        setShowSizePopup(false);
        refreshCart();
        setTimeout(() => setAdded(false), 2000);
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={cn("group relative", className)}>
      {/* Size popup */}
      {showSizePopup && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          onClick={() => setShowSizePopup(false)}
        >
          <div
            className="bg-background rounded-xl p-5 w-full max-w-xs shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-foreground line-clamp-1">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPrice(effectivePrice)}
                </p>
              </div>
              <button
                onClick={() => setShowSizePopup(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Select Size
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.variants?.map((v) => {
                const outOfStock = v.stock_qty === 0;
                return (
                  <button
                    key={v.id}
                    disabled={outOfStock}
                    onClick={() => setSelectedSize(v.id)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-semibold border rounded-md transition-all",
                      selectedSize === v.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                      outOfStock &&
                        "opacity-40 cursor-not-allowed line-through",
                    )}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => selectedSize && handleAddToCart(selectedSize)}
              disabled={!selectedSize || adding}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-md text-sm font-semibold disabled:opacity-50 transition-all"
            >
              {adding ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShoppingBag size={16} />
              )}
              Add to Cart
            </button>
          </div>
        </div>
      )}

      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-muted aspect-product">
          <Image
            src={getImageUrl(primaryImage?.url ?? "", 600)}
            alt={primaryImage?.alt_text || product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />

          {hoverImage && (
            <Image
              src={getImageUrl(hoverImage.url, 600)}
              alt={hoverImage.alt_text || product.name}
              fill
              className="object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {!imageLoaded && (
            <div className="absolute inset-0 animate-shimmer rounded-xl" />
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-xl">
              <span className="badge-out-of-stock">Out of Stock</span>
            </div>
          )}

          {badgeText && !isOutOfStock && (
            <div
              className={cn(
                "absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full tracking-wide",
                badgeClass,
              )}
            >
              {badgeText}
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={async (e) => {
                e.preventDefault();
                setIsWishlisted(!isWishlisted);
                try {
                  await toggleWishlist(product.id);
                  refreshWishlist();
                } catch {
                  setIsWishlisted((prev) => !prev);
                }
              }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-150 active:scale-90",
                isWishlisted
                  ? "bg-red-50 text-red-500"
                  : darkMode
                    ? "bg-black/40 border border-white/40 text-white hover:bg-white/10"
                    : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart size={16} className={cn(isWishlisted && "fill-current")} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/products/${product.slug}`;
              }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors",
                darkMode
                  ? "bg-black/40 border border-white/40 text-white hover:bg-white/10"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Quick Add button */}
          {!isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleQuickAdd}
                className={cn(
                  "w-full py-3 text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                  added
                    ? "bg-emerald-500 text-white"
                    : "bg-foreground text-background hover:bg-foreground/90",
                )}
              >
                {adding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ShoppingBag size={14} />
                )}
                {added ? "Added!" : "Quick Add"}
              </button>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="mt-3 space-y-1.5">
          {product.category && (
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {product.category.name}
            </p>
          )}
          <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {truncate(product.name, 60)}
          </h3>

          {product.review_count > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={cn(
                      i < Math.round(product.avg_rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.review_count})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">
              {formatPrice(effectivePrice)}
            </span>
            {discountPct > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.base_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-product rounded-xl animate-shimmer bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-1/3 rounded animate-shimmer bg-muted" />
        <div className="h-4 w-4/5 rounded animate-shimmer bg-muted" />
        <div className="h-4 w-1/2 rounded animate-shimmer bg-muted" />
      </div>
    </div>
  );
}
