"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle, CreditCard, Truck } from "lucide-react";
import { cn, formatPrice, BD_DIVISIONS, BD_DISTRICTS } from "@/lib/utils";

type Step = "shipping" | "payment" | "confirm";

const STEPS = [
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "confirm", label: "Confirm" },
] as const;

const ORDER_SUMMARY = [
  { name: "Premium Oxford Shirt (M × 2)", price: 2980 },
  { name: "Slim Fit Chino Pants (32 × 1)", price: 1890 },
];

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "sslcommerz">(
    "cod",
  );
  const [placed, setPlaced] = useState(false);

  const [shippingForm, setShippingForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    district: "",
    division: "Dhaka",
    postal_code: "",
    notes: "",
  });

  const set =
    (k: keyof typeof shippingForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setShippingForm((p) => ({ ...p, [k]: e.target.value }));

  const subtotal = ORDER_SUMMARY.reduce((s, i) => s + i.price, 0);
  const shipping = subtotal >= 1500 ? 0 : 80;
  const total = subtotal + shipping;

  if (placed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Order Placed!
          </h1>
          <p className="text-muted-foreground mb-1">
            Thank you for your order.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Order <strong>#ORD-240103-DEMO</strong> confirmed. We&apos;ll SMS
            you with tracking updates.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard/orders"
              className="px-5 py-2.5 border border-border rounded-md text-sm font-semibold hover:bg-secondary transition-colors"
            >
              View Orders
            </Link>
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-foreground text-background rounded-md text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-main max-w-5xl">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/cart" className="hover:text-foreground">
            Cart
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium">Checkout</span>
        </nav>

        {/* Progress */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    step === s.key
                      ? "bg-foreground text-background"
                      : STEPS.findIndex((x) => x.key === step) > i
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {STEPS.findIndex((x) => x.key === step) > i ? (
                    <CheckCircle size={14} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1",
                    step === s.key
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-20 h-px mx-2 mb-4",
                    STEPS.findIndex((x) => x.key === step) > i
                      ? "bg-emerald-500"
                      : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form area */}
          <div className="lg:col-span-2">
            {/* Shipping form */}
            {step === "shipping" && (
              <div className="bg-background border border-border rounded-xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Truck size={20} className="text-accent" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Full Name *
                    </label>
                    <input
                      value={shippingForm.full_name}
                      onChange={set("full_name")}
                      className="input-field"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Phone *
                    </label>
                    <input
                      value={shippingForm.phone}
                      onChange={set("phone")}
                      className="input-field"
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={shippingForm.email}
                      onChange={set("email")}
                      className="input-field"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Address Line 1 *
                    </label>
                    <input
                      value={shippingForm.address_line1}
                      onChange={set("address_line1")}
                      className="input-field"
                      placeholder="House / Road / Area"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Address Line 2
                    </label>
                    <input
                      value={shippingForm.address_line2}
                      onChange={set("address_line2")}
                      className="input-field"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Division *
                    </label>
                    <select
                      value={shippingForm.division}
                      onChange={set("division")}
                      className="input-field"
                    >
                      {BD_DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      District *
                    </label>
                    <select
                      value={shippingForm.district}
                      onChange={set("district")}
                      className="input-field"
                    >
                      <option value="">Select District</option>
                      {(BD_DISTRICTS[shippingForm.division] ?? []).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      City / Thana *
                    </label>
                    <input
                      value={shippingForm.city}
                      onChange={set("city")}
                      className="input-field"
                      placeholder="City / Thana"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Postal Code
                    </label>
                    <input
                      value={shippingForm.postal_code}
                      onChange={set("postal_code")}
                      className="input-field"
                      placeholder="1213"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Order Notes (optional)
                    </label>
                    <textarea
                      value={shippingForm.notes}
                      onChange={set("notes")}
                      className="input-field resize-none"
                      rows={2}
                      placeholder="Any special instructions?"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep("payment")}
                  disabled={
                    !shippingForm.full_name ||
                    !shippingForm.phone ||
                    !shippingForm.address_line1 ||
                    !shippingForm.city ||
                    !shippingForm.district
                  }
                  className="mt-6 w-full bg-foreground text-background py-3 rounded-md text-sm font-semibold hover:bg-foreground/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment */}
            {step === "payment" && (
              <div className="bg-background border border-border rounded-xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-accent" /> Payment
                  Method
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      value: "cod",
                      label: "Cash on Delivery",
                      desc: "Pay when your order arrives",
                      icon: "💵",
                    },
                    {
                      value: "sslcommerz",
                      label: "Online Payment",
                      desc: "Visa, Mastercard, bKash, Nagad via SSLCommerz",
                      icon: "💳",
                    },
                  ].map((pm) => (
                    <label
                      key={pm.value}
                      className={cn(
                        "flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all",
                        paymentMethod === pm.value
                          ? "border-foreground bg-secondary/30"
                          : "border-border hover:border-muted-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.value}
                        checked={
                          paymentMethod === (pm.value as typeof paymentMethod)
                        }
                        onChange={() =>
                          setPaymentMethod(pm.value as typeof paymentMethod)
                        }
                        className="sr-only"
                      />
                      <span className="text-2xl">{pm.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {pm.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pm.desc}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                          paymentMethod === pm.value
                            ? "border-foreground"
                            : "border-border",
                        )}
                      >
                        {paymentMethod === pm.value && (
                          <div className="w-2 h-2 bg-foreground rounded-full" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep("shipping")}
                    className="flex-1 py-3 border border-border rounded-md text-sm font-semibold hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    className="flex-1 py-3 bg-foreground text-background rounded-md text-sm font-semibold hover:bg-foreground/90 active:scale-95 transition-all"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Confirm */}
            {step === "confirm" && (
              <div className="bg-background border border-border rounded-xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-5">
                  Review Your Order
                </h2>

                <div className="bg-secondary/40 rounded-xl p-4 mb-4 text-sm">
                  <p className="font-semibold text-foreground mb-1">
                    Shipping to:
                  </p>
                  <p className="text-muted-foreground">
                    {shippingForm.full_name} • {shippingForm.phone}
                  </p>
                  <p className="text-muted-foreground">
                    {shippingForm.address_line1}, {shippingForm.city},{" "}
                    {shippingForm.district}, {shippingForm.division}
                  </p>
                </div>

                <div className="bg-secondary/40 rounded-xl p-4 mb-6 text-sm">
                  <p className="font-semibold text-foreground mb-1">Payment:</p>
                  <p className="text-muted-foreground">
                    {paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment (SSLCommerz)"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("payment")}
                    className="flex-1 py-3 border border-border rounded-md text-sm font-semibold hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setPlaced(true)}
                    className="flex-2 flex-1 py-3 bg-foreground text-background rounded-md text-sm font-bold tracking-wide hover:bg-foreground/90 active:scale-95 transition-all"
                  >
                    Place Order — {formatPrice(total)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="bg-background border border-border rounded-xl p-6 h-fit">
            <h3 className="text-base font-bold text-foreground mb-4">
              Order Summary
            </h3>
            <div className="space-y-3 mb-4">
              {ORDER_SUMMARY.map((i) => (
                <div key={i.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex-1 pr-4">
                    {i.name}
                  </span>
                  <span className="font-semibold">{formatPrice(i.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
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
              <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
