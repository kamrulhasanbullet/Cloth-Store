import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { User, ShoppingBag, Heart, MapPin, Star, Bell } from "lucide-react";

const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Profile", icon: User },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/reviews", label: "My Reviews", icon: Star },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="section-padding">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-background border border-border rounded-xl overflow-hidden sticky top-24">
                <div className="p-5 bg-secondary/40 border-b border-border">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                    <User size={22} className="text-accent" />
                  </div>
                  <p className="font-bold text-foreground text-sm">
                    My Account
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Manage your profile and orders
                  </p>
                </div>
                <nav className="p-2">
                  {DASHBOARD_NAV.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <main className="lg:col-span-3">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
