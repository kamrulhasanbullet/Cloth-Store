"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { submitReview } from "@/app/actions/reviews";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          onMouseEnter={() => onChange && setHovered(i + 1)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={cn(
            "transition-colors",
            onChange ? "cursor-pointer" : "cursor-default",
          )}
        >
          <Star
            size={onChange ? 22 : 14}
            className={cn(
              (hovered || value) > i
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted",
            )}
          />
        </button>
      ))}
    </div>
  );
}

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  is_verified: boolean;
  profile?: { full_name: string; avatar_url: string };
}

interface ProductReviewsProps {
  productId: string;
  initialReviews: Review[];
  canReview: boolean;
  avgRating: number;
  reviewCount: number;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProductReviews({
  productId,
  initialReviews,
  canReview,
  avgRating,
  reviewCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);

    const result = await submitReview(productId, rating, title, body);
    if (result.success) {
      setSubmitted(true);
      setShowForm(false);
    } else {
      setError(result.error ?? "Something went wrong");
    }
    setSubmitting(false);
  };

  return (
    <section id="reviews" className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-title">Customer Reviews</h2>
          {reviewCount > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating value={Math.round(avgRating)} />
              <span className="text-sm font-semibold text-foreground">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({reviewCount} reviews)
              </span>
            </div>
          )}
        </div>
        {canReview && !showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-md hover:bg-foreground/90 transition-all"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-secondary/30 border border-border rounded-xl p-6 mb-8"
        >
          <h3 className="text-sm font-bold text-foreground mb-4">
            Your Review
          </h3>

          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Rating
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Title (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Review
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell others about your experience with this product..."
              rows={4}
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive mb-4 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-md hover:bg-foreground/90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      )}

      {/* Submitted success */}
      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8">
          <p className="text-sm font-semibold text-emerald-700">
            ✓ Review submitted! It will appear after admin approval.
          </p>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-sm">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-background border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0 overflow-hidden">
                    {review.profile?.avatar_url ? (
                      <img
                        src={review.profile.avatar_url}
                        alt={review.profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(review.profile?.full_name ?? "AN")
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {review.profile?.full_name ?? "Anonymous"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating value={review.rating} />
                      {review.is_verified && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(review.created_at, {
                    year: undefined,
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {review.title && (
                <p className="text-sm font-semibold text-foreground mb-1">
                  {review.title}
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
