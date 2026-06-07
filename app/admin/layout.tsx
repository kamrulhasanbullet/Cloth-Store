import Link from "next/link";
import { requireAdminUser } from "@/lib/admin-guard";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Folder,
  Users,
  Tag,
  Star,
  BarChart2,
  ImageIcon,
  Settings,
  Zap,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
  { href: "/admin/collections", label: "Collections", icon: Folder },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminUser();

  return (
    <div className="min-h-screen flex bg-secondary/20">
      {/* Sidebar */}
      <aside className="w-60 bg-foreground text-background shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b border-background/10">
          <Link
            href="/"
            className="font-serif text-xl font-bold text-background"
          >
            ARISTO
          </Link>
          <p className="text-background/50 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-background/70 hover:text-background hover:bg-background/10 rounded-md transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-background/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-background/50 hover:text-background transition-colors"
          >
            <Settings size={16} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
          <h1 className="text-sm font-semibold text-foreground">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Welcome, Admin
            </span>
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xs font-bold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
