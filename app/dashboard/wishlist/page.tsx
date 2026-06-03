import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice, getEffectivePrice } from "@/lib/utils";

const DEMO_WISHLIST = [
  {
    id: "1",
    slug: "premium-oxford-shirt",
    name: "Premium Oxford Shirt",
    base_price: 1490,
    sale_price: null,
    image:
      "https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Shirts",
  },
  {
    id: "2",
    slug: "slim-fit-chino",
    name: "Slim Fit Chino Pants",
    base_price: 2200,
    sale_price: 1890,
    image:
      "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400",
    category: "Pants",
  },
];

export default function WishlistPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {DEMO_WISHLIST.length} saved items
        </p>
      </div>

      {DEMO_WISHLIST.length === 0 ? (
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
          {DEMO_WISHLIST.map((item) => (
            <div
              key={item.id}
              className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-card transition-shadow"
            >
              <Link href={`/products/${item.slug}`}>
                <div className="relative aspect-product bg-muted">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              </Link>
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-0.5">
                  {item.category}
                </p>
                <Link href={`/products/${item.slug}`}>
                  <p className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-2">
                    {item.name}
                  </p>
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold">
                    {formatPrice(
                      getEffectivePrice(item.base_price, item.sale_price),
                    )}
                  </span>
                  <button className="text-xs font-semibold text-accent hover:underline">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
