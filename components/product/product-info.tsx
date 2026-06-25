"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RefreshCw,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  cn,
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getStockStatus,
} from "@/lib/utils";
import type { Product, ProductVariant } from "@/lib/types";
import { toggleWishlist } from "@/app/actions/wishlist";
import { addToCart } from "@/app/actions/cart";

interface ProductInfoProps {
  product: Product;
  initialWishlisted?: boolean;
}

function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-sm font-semibold text-foreground hover:text-accent transition-colors"
      >
        {title}
        <ChevronDown
          size={16}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductInfo({
  product,
  initialWishlisted = false,
}: ProductInfoProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.find((v) => v.is_active && v.stock_qty > 0) ??
      product.variants?.[0] ??
      null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [cartLoading, setCartLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [cartMsg, setCartMsg] = useState<string | null>(null);

  const allSizes = product.variants?.map((v) => v.size) ?? [];
  const sizes = allSizes.filter((s, i) => allSizes.indexOf(s) === i);

  const colorEntries: { color: string; hex: string }[] = [];
  const seenColors = new Set<string>();
  for (const v of product.variants ?? []) {
    if (v.color && !seenColors.has(v.color)) {
      seenColors.add(v.color);
      colorEntries.push({ color: v.color, hex: v.color_hex });
    }
  }

  const activeVariantsBySizeAndColor = (size: string, color?: string) =>
    product.variants?.find(
      (v) =>
        v.size === size && (color ? v.color === color : true) && v.is_active,
    ) ?? null;

  const effectivePrice = selectedVariant
    ? getEffectivePrice(
        selectedVariant.price || product.base_price,
        selectedVariant.sale_price || product.sale_price,
      )
    : getEffectivePrice(product.base_price, product.sale_price);

  const originalPrice = selectedVariant
    ? selectedVariant.price || product.base_price
    : product.base_price;

  const discount = getDiscountPercent(originalPrice, effectivePrice);
  const stockStatus = selectedVariant
    ? getStockStatus(
        selectedVariant.stock_qty,
        selectedVariant.low_stock_threshold,
      )
    : getStockStatus(product.total_stock, 5);

  const stockColors = {
    in_stock: "text-emerald-600",
    low_stock: "text-amber-600",
    out_of_stock: "text-destructive",
  };

  const stockLabels = {
    in_stock: "In Stock",
    low_stock: `Only ${selectedVariant?.stock_qty ?? product.total_stock} left`,
    out_of_stock: "Out of Stock",
  };

  const hasVariants = (product.variants?.length ?? 0) > 0;

  const handleAddToCart = async (redirect = false) => {
    if (hasVariants && !selectedVariant) {
      setCartMsg("Please select a size");
      return;
    }

    if (redirect) setBuyLoading(true);
    else setCartLoading(true);
    setCartMsg(null);

    try {
      const result = await addToCart(
        product.id,
        selectedVariant?.id ?? null,
        quantity,
      );

      if (!result.success) {
        setCartMsg(result.error ?? "Failed to add to cart");
        return;
      }

      if (redirect) {
        router.push("/checkout");
      } else {
        setCartMsg("Added to cart!");
        setTimeout(() => setCartMsg(null), 2000);
      }
    } catch {
      setCartMsg("Something went wrong");
    } finally {
      setCartLoading(false);
      setBuyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {product.category && (
        <p className="text-accent text-xs font-semibold uppercase tracking-widest">
          {product.category.name}
        </p>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
        {product.name}
      </h1>

      {/* Rating */}
      {product.review_count > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={cn(
                  i < Math.round(product.avg_rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted",
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">
            {product.avg_rating}
          </span>
          <a
            href="#reviews"
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            ({product.review_count} reviews)
          </a>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-foreground">
          {formatPrice(effectivePrice)}
        </span>
        {discount > 0 && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
            <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          </>
        )}
      </div>

      {product.short_desc && (
        <p className="text-muted-foreground text-sm leading-relaxed">
          {product.short_desc}
        </p>
      )}

      {/* Color selector */}
      {colorEntries.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            Color:{" "}
            <span className="font-normal text-muted-foreground">
              {selectedVariant?.color ?? "Select"}
            </span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {colorEntries.map(({ color, hex }) => (
              <button
                key={color}
                onClick={() => {
                  const v = activeVariantsBySizeAndColor(
                    selectedVariant?.size ?? sizes[0],
                    color,
                  );
                  if (v) setSelectedVariant(v);
                }}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  selectedVariant?.color === color
                    ? "border-foreground scale-110"
                    : "border-border hover:border-muted-foreground",
                )}
                style={{ backgroundColor: hex || color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">
              Size:{" "}
              <span className="font-normal text-muted-foreground">
                {selectedVariant?.size ?? "Select a size"}
              </span>
            </p>
            <button className="text-xs text-accent hover:underline">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = activeVariantsBySizeAndColor(
                size,
                selectedVariant?.color,
              );
              const outOfStock = !variant || variant.stock_qty === 0;
              const isSelected = selectedVariant?.size === size;
              return (
                <button
                  key={size}
                  onClick={() => variant && setSelectedVariant(variant)}
                  disabled={outOfStock}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold border rounded-md transition-all",
                    isSelected && !outOfStock
                      ? "border-foreground bg-foreground text-background"
                      : "",
                    !isSelected && !outOfStock
                      ? "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      : "",
                    outOfStock
                      ? "border-border text-muted-foreground/40 cursor-not-allowed line-through"
                      : "",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      <p className={cn("text-sm font-medium", stockColors[stockStatus])}>
        {stockLabels[stockStatus]}
      </p>

      {/* Cart message */}
      {cartMsg && (
        <p
          className={cn(
            "text-sm font-medium px-3 py-2 rounded-md",
            cartMsg === "Added to cart!"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600",
          )}
        >
          {cartMsg}
        </p>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center border border-border rounded-md overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-lg"
          >
            -
          </button>
          <span className="w-12 text-center text-sm font-semibold text-foreground">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity(
                Math.min(selectedVariant?.stock_qty ?? 10, quantity + 1),
              )
            }
            className="w-10 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-lg"
          >
            +
          </button>
        </div>
        <button
          onClick={() => handleAddToCart(false)}
          disabled={stockStatus === "out_of_stock" || cartLoading}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-semibold tracking-wide transition-all active:scale-95",
            stockStatus !== "out_of_stock"
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {cartLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ShoppingBag size={18} />
          )}
          {stockStatus === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
        </button>
        <button
          onClick={async () => {
            setIsWishlisted(!isWishlisted);
            try {
              await toggleWishlist(product.id);
            } catch {
              setIsWishlisted((prev) => !prev);
            }
          }}
          className={cn(
            "w-12 h-12 border rounded-md flex items-center justify-center transition-all hover:scale-105",
            isWishlisted
              ? "border-red-300 bg-red-50 text-red-500"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
          )}
        >
          <Heart size={18} className={cn(isWishlisted && "fill-current")} />
        </button>
      </div>

      {/* Buy Now */}
      {stockStatus !== "out_of_stock" && (
        <button
          onClick={() => handleAddToCart(true)}
          disabled={buyLoading}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-foreground text-foreground text-sm font-semibold rounded-md hover:bg-foreground hover:text-background transition-all active:scale-95 disabled:opacity-50"
        >
          {buyLoading && <Loader2 size={16} className="animate-spin" />}
          Buy Now
        </button>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 pt-4">
        {[
          { icon: Truck, label: "Free Shipping", sub: "Above ৳1,500" },
          { icon: Shield, label: "Secure Payment", sub: "SSLCommerz & COD" },
          { icon: RefreshCw, label: "Easy Returns", sub: "7 days policy" },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="text-center p-3 bg-secondary/50 rounded-xl"
          >
            <Icon size={18} className="text-accent mx-auto mb-1" />
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      {/* Accordions */}
      <div className="pt-4">
        <AccordionItem title="Product Description">
          <p>{product.description || "No description available."}</p>
        </AccordionItem>
        {product.material && (
          <AccordionItem title="Material & Care">
            <p>
              <strong>Material:</strong> {product.material}
            </p>
            {product.care_instructions && (
              <p className="mt-2">
                <strong>Care:</strong> {product.care_instructions}
              </p>
            )}
          </AccordionItem>
        )}
        <AccordionItem title="Shipping & Returns">
          <ul className="space-y-1 list-disc list-inside">
            <li>Standard delivery 2-5 business days across Bangladesh</li>
            <li>Same-day delivery available in Dhaka (orders before 12PM)</li>
            <li>Free delivery on orders above ৳1,500</li>
            <li>7-day easy return on unworn items with tags attached</li>
          </ul>
        </AccordionItem>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Share2 size={14} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Share this product
        </span>
      </div>
    </div>
  );
}
