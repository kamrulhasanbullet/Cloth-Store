import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ARISTO — Premium Men's Fashion Bangladesh",
    template: "%s | ARISTO",
  },
  description:
    "Discover premium men's fashion — shirts, pants, t-shirts, and jerseys. Quality fabrics, modern cuts, delivered across Bangladesh.",
  keywords: [
    "men's fashion",
    "Bangladesh",
    "shirts",
    "pants",
    "t-shirts",
    "jerseys",
    "eid collection",
    "summer collection",
  ],
  authors: [{ name: "ARISTO" }],
  creator: "ARISTO",
  metadataBase: new URL("https://aristo.com.bd"),
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://aristo.com.bd",
    siteName: "ARISTO",
    title: "ARISTO — Premium Men's Fashion Bangladesh",
    description:
      "Discover premium men's fashion — shirts, pants, t-shirts, and jerseys.",
    images: [
      {
        url: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ARISTO — Premium Men's Fashion Bangladesh",
    description:
      "Discover premium men's fashion — shirts, pants, t-shirts, and jerseys.",
    images: [
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
    ],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, playfair.variable)}>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
