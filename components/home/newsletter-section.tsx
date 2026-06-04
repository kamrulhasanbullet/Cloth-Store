"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="py-20 bg-foreground text-background">
      <div className="container-main text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={24} className="text-accent" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-background mb-3">
          Stay In Style
        </h2>
        <p className="text-background/70 text-lg mb-8">
          Subscribe and get 10% off your first order, plus early access to new
          collections and exclusive offers.
        </p>

        {submitted ? (
          <div className="bg-background/10 border border-background/20 rounded-xl px-8 py-5 inline-block">
            <p className="text-background font-semibold text-lg">
              You&apos;re on the list!
            </p>
            <p className="text-background/70 text-sm mt-1">
              Check your inbox for your 10% discount code.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-5 py-3 bg-background/10 border border-background/20 rounded-md text-background placeholder:text-background/40 focus:outline-none focus:border-background/60 text-sm"
            />
            <button
              type="submit"
              className="bg-accent text-accent-foreground px-6 py-3 rounded-md font-semibold text-sm tracking-wide hover:bg-accent/90 active:scale-95 transition-all flex items-center gap-2 justify-center whitespace-nowrap"
            >
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        )}

        <p className="text-background/40 text-xs mt-4">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
