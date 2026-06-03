"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

// Placeholder cart state — in production this would come from a cart context / Supabase
const DEMO_ITEMS = [
  {
    id: "1",
    product_name: "Premium Oxford Shirt",
    variant_sku: "SHT-M-WHITE",
    size: "M",
    color: "White",
    image_url:
      "https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=400",
    unit_price: 1490,
    quantity: 2,
  },
  {
    id: "2",
    product_name: "Slim Fit Chino Pants",
    variant_sku: "PNT-32-NAVY",
    size: "32",
    color: "Navy",
    image_url:
      "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400",
    unit_price: 1890,
    quantity: 1,
  },
];

export default function CartPage() {
  const [items, setItems] = useState(DEMO_ITEMS);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState("");
  const [discount, setDiscount] = useState(0);

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setItems((p) => p.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const removeItem = (id: string) =>
    setItems((p) => p.filter((i) => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const shipping = subtotal >= 1500 ? 0 : 80;
  const total = subtotal + shipping - discount;

  const applyCoupon = () => {
    if (couponInput.toUpperCase() === "ARISTO10") {
      const d = Math.round(subtotal * 0.1);
      setDiscount(d);
      setCouponApplied(couponInput.toUpperCase());
    }
    setCouponInput("");
  };

  return (
    <div className="section-padding">
      <div className="container-main">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-background border border-border rounded-xl"
                >
                  <Link
                    href="/shop"
                    className="relative w-20 h-24 rounded-lg overflow-hidden bg-muted shrink-0"
                  >
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {item.product_name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Size: {item.size}{" "}
                          {item.color && `• Color: ${item.color}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.variant_sku}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-md overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors text-base"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors text-base"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-base font-bold text-foreground">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="bg-background border border-border rounded-xl p-6">
                <h2 className="text-base font-bold text-foreground mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      items)
                    </span>
                    <span className="font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span
                      className={cn(
                        "font-semibold",
                        shipping === 0 && "text-emerald-600",
                      )}
                    >
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Tag size={12} />
                        <span>Coupon ({couponApplied})</span>
                      </div>
                      <span className="font-semibold text-emerald-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mt-5">
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                      <div className="flex items-center gap-2 text-emerald-700 text-sm">
                        <Tag size={14} />
                        <span className="font-semibold">{couponApplied}</span>
                        <span>applied</span>
                      </div>
                      <button
                        onClick={() => {
                          setCouponApplied("");
                          setDiscount(0);
                        }}
                        className="text-emerald-600 hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code"
                        className="input-field text-xs flex-1"
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2 border border-border text-sm font-semibold rounded-md hover:bg-secondary transition-colors whitespace-nowrap"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-md text-sm font-semibold tracking-wide hover:bg-foreground/90 active:scale-95 transition-all"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>

                <Link
                  href="/shop"
                  className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {shipping > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                  Add <strong>{formatPrice(1500 - subtotal)}</strong> more for
                  free shipping!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
