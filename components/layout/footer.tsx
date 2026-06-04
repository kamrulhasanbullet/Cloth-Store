import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];

const SHOP_LINKS = [
  { label: "Shirts", href: "/shop?category=shirts" },
  { label: "Pants", href: "/shop?category=pants" },
  { label: "T-Shirts", href: "/shop?category=t-shirts" },
  { label: "Jerseys", href: "/shop?category=jerseys" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Sale", href: "/collections/sale" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main footer */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-3xl font-bold tracking-tight text-background">
                ARISTO
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              Premium men&apos;s fashion crafted for the modern Bangladeshi
              gentleman. Quality, style, and comfort — all in one place.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-background text-sm tracking-widest uppercase mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 text-sm hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-background text-sm tracking-widest uppercase mb-5">
              Information
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/70 text-sm hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-background text-sm tracking-widest uppercase mb-5">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                <span className="text-background/70 text-sm">
                  House 12, Road 5, Banani
                  <br />
                  Dhaka-1213, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-accent shrink-0" />
                <a
                  href="tel:+8801700000000"
                  className="text-background/70 text-sm hover:text-background transition-colors"
                >
                  +880 1700-000000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-accent shrink-0" />
                <a
                  href="mailto:hello@aristo.com.bd"
                  className="text-background/70 text-sm hover:text-background transition-colors"
                >
                  hello@aristo.com.bd
                </a>
              </li>
            </ul>

            {/* Payment logos */}
            <div className="mt-6">
              <p className="text-background/50 text-xs mb-3 uppercase tracking-wider">
                We Accept
              </p>
              <div className="flex items-center gap-2">
                <div className="bg-background/10 border border-background/20 rounded px-2 py-1 text-xs font-semibold text-background/80">
                  COD
                </div>
                <div className="bg-background/10 border border-background/20 rounded px-2 py-1 text-xs font-semibold text-background/80">
                  SSLCommerz
                </div>
                <div className="bg-background/10 border border-background/20 rounded px-2 py-1 text-xs font-semibold text-background/80">
                  bKash
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-background/50 text-xs">
            &copy; {new Date().getFullYear()} ARISTO. All rights reserved.
          </p>
          <p className="text-background/50 text-xs">
            Made with care in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
