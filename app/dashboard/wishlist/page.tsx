"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, Loader2 } from "lucide-react";
import { formatPrice, getEffectivePrice } from "@/lib/utils";
import { getWishlistItems, toggleWishlist } from "@/app/actions/wishlist";
import type { WishlistItem } from "@/lib/types";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadWishlist = useCallback(async () => {
    try {
      const data = await getWishlistItems();
      setItems(data);
    } catch {
      // Not authenticated
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId: string, itemId: string) => {
    setRemoving(itemId);
    await toggleWishlist(productId);
    setItems((p) => p.filter((i) => i.id !== itemId));
    setRemoving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {items.length} saved items
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-background border border-border rounded-xl p-12 text-center">
          <Heart size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Link
            href="/shop"
            className="inline-flex mt-4 text-sm font-semibold text-accent hover:underline"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const primaryImg =
              product.images?.find((img) => img.is_primary)?.url ??
              product.images?.[0]?.url ??
              "";
            const effectivePrice = getEffectivePrice(
              product.base_price,
              product.sale_price,
            );

            return (
              <div
                key={item.id}
                className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-card transition-shadow"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="relative aspect-product bg-muted">
                    <Image
                      src={
                        primaryImg ||
                        "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                </Link>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {product.category?.name ?? ""}
                  </p>
                  <Link href={`/products/${product.slug}`}>
                    <p className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-2">
                      {product.name}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold">
                      {formatPrice(effectivePrice)}
                    </span>
                    <button
                      onClick={() => handleRemove(product.id, item.id)}
                      disabled={removing === item.id}
                      className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                    >
                      {removing === item.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Remove"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
