"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  {
    label: "Collections",
    href: "/collections",
    children: [
      { label: "Summer Collection", href: "/collections/summer" },
      { label: "Winter Collection", href: "/collections/winter" },
      { label: "Eid Collection", href: "/collections/eid" },
      { label: "New Arrivals", href: "/collections/new-arrivals" },
      { label: "Premium", href: "/collections/premium" },
      { label: "Limited Edition", href: "/collections/limited-edition" },
    ],
  },
  { label: "Shirts", href: "/shop?category=shirts" },
  { label: "Pants", href: "/shop?category=pants" },
  { label: "T-Shirts", href: "/shop?category=t-shirts" },
  { label: "Jerseys", href: "/shop?category=jerseys" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-foreground text-background text-xs py-2 text-center font-medium tracking-wide">
        <span className="hidden sm:inline">
          Free delivery on orders above ৳1,500 |{" "}
        </span>
        Cash on Delivery available nationwide &nbsp;|&nbsp;
        <span className="hidden sm:inline">
          Call us:{" "}
          <a href="tel:+8801700000000" className="underline">
            01700-000000
          </a>
        </span>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-nav border-b border-border"
            : "bg-background border-b border-border",
        )}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 select-none">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                ARISTO
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative group">
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        "text-muted-foreground hover:text-foreground hover:bg-secondary",
                      )}
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className="transition-transform group-hover:rotate-180"
                      />
                    </button>
                    <div
                      className={cn(
                        "absolute top-full left-0 mt-1 w-52 bg-background border border-border rounded-xl shadow-dropdown py-2",
                        "transition-all duration-200 origin-top",
                        openDropdown === link.label
                          ? "opacity-100 scale-100 pointer-events-auto"
                          : "opacity-0 scale-95 pointer-events-none",
                      )}
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname === link.href
                        ? "text-foreground bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Link
                href="/search"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </Link>
              <Link
                href="/dashboard/wishlist"
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
              <Link
                href="/cart"
                className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                href="/auth/login"
                className="hidden sm:flex p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Account"
              >
                <User size={20} />
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-1"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background animate-fade-in-up">
            <div className="container-main py-4 space-y-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === link.label ? null : link.label,
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md"
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform",
                          openDropdown === link.label && "rotate-180",
                        )}
                      />
                    </button>
                    {openDropdown === link.label && (
                      <div className="pl-4 space-y-1 mt-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary rounded-md"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <div className="pt-4 border-t border-border flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="flex-1 text-center py-2 text-sm font-semibold border border-border rounded-md hover:bg-secondary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-1 text-center py-2 text-sm font-semibold bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
