import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "On orders above ৳1,500 nationwide",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "SSLCommerz, bKash & Cash on Delivery",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    desc: "7-day hassle-free return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "Call or WhatsApp us anytime",
  },
];

export function FeatureBar() {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 py-5 px-6 first:pl-0 last:pr-0"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-accent" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
