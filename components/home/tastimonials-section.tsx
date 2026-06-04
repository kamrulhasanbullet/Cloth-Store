import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Rafiq Ahmed",
    location: "Dhaka",
    rating: 5,
    text: "The quality of ARISTO shirts is absolutely outstanding. The fabric feels premium and the fit is perfect. Definitely ordering again!",
    avatar: "RA",
  },
  {
    id: 2,
    name: "Karim Hassan",
    location: "Chittagong",
    rating: 5,
    text: "Ordered for Eid and got it delivered in 2 days. The packaging was excellent and the clothes look even better in person.",
    avatar: "KH",
  },
  {
    id: 3,
    name: "Nasir Uddin",
    location: "Sylhet",
    rating: 5,
    text: "Best men's fashion brand in Bangladesh. The winter collection is exactly what I needed — warm, stylish, and comfortable.",
    avatar: "NU",
  },
  {
    id: 4,
    name: "Fahim Chowdhury",
    location: "Rajshahi",
    rating: 5,
    text: "Amazing customer service. Had a size issue and they resolved it within 24 hours. Very impressed with the brand!",
    avatar: "FC",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-main">
        <div className="text-center mb-12">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">
            Customer Love
          </p>
          <h2 className="section-title">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-background rounded-2xl p-6 shadow-card relative"
            >
              <Quote size={24} className="text-accent/20 mb-4 fill-accent/10" />
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {t.text}
              </p>
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
