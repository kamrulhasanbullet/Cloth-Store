"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { getAdminReviews, updateReview } from "@/app/actions/admin";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    setLoading(true);
    const approved =
      filter === "approved" ? true : filter === "pending" ? false : undefined;
    const { reviews: r, count } = await getAdminReviews(1, 50, approved);
    setReviews(r);
    setTotalCount(count);
    setLoading(false);
  };

  const handleApprove = async (reviewId: string) => {
    await updateReview(reviewId, { is_approved: true });
    loadReviews();
  };

  const handleReject = async (reviewId: string) => {
    await updateReview(reviewId, { is_approved: false });
    loadReviews();
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} total reviews
          </p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl mb-5">
        <div className="flex items-center gap-2 p-4 overflow-x-auto scrollbar-hide">
          {["All", "Pending", "Approved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f.toLowerCase())}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                filter === f.toLowerCase()
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-background border border-border rounded-xl">
            No reviews found
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-background border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {review.profile?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {review.profile?.full_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at, {
                          year: undefined,
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-amber-500">
                        {renderStars(review.rating)}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        on {review.product?.name}
                      </span>
                    </div>
                    {review.title && (
                      <p className="font-semibold text-foreground text-sm">
                        {review.title}
                      </p>
                    )}
                    {review.body && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {review.body}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        review.is_verified
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {review.is_verified ? "Verified Purchase" : "Unverified"}
                    </span>
                    {review.is_approved && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        Approved
                      </span>
                    )}
                  </div>
                </div>

                {!review.is_approved && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
