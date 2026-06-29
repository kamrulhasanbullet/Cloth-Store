import { Star, Quote } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase-server";

async function getApprovedReviews() {
  const sb = await getServerSupabase();
  const { data } = await sb
    .from("reviews")
    .select(
      "id, rating, title, body, created_at, profile:profiles(full_name, avatar_url)",
    )
    .eq("is_approved", true)
    .gte("rating", 4)
    .order("helpful_count", { ascending: false })
    .limit(8);

  return (data ?? []).map((r) => ({
    ...r,
    profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
  }));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function TestimonialsSection() {
  const reviews = await getApprovedReviews();
  if (reviews.length === 0) return null;

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
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-background rounded-2xl p-6 shadow-card relative"
            >
              <Quote size={24} className="text-accent/20 mb-4 fill-accent/10" />
              {r.title && (
                <p className="text-sm font-semibold text-foreground mb-2">
                  {r.title}
                </p>
              )}
              <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-4">
                {r.body}
              </p>
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold overflow-hidden">
                  {r.profile?.avatar_url ? (
                    <img
                      src={r.profile.avatar_url}
                      alt={r.profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(r.profile?.full_name ?? "AN")
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {r.profile?.full_name ?? "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verified Customer
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
