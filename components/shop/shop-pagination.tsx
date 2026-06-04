import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, range } from "@/lib/utils";

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  buildPageUrl: (page: number) => string;
}

export function ShopPagination({
  currentPage,
  totalPages,
  buildPageUrl,
}: ShopPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = (() => {
    if (totalPages <= 7) return range(1, totalPages);
    if (currentPage <= 4) return [...range(1, 5), -1, totalPages];
    if (currentPage >= totalPages - 3)
      return [1, -1, ...range(totalPages - 4, totalPages)];
    return [1, -1, ...range(currentPage - 1, currentPage + 1), -2, totalPages];
  })();

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-12"
      aria-label="Pagination"
    >
      {currentPage > 1 && (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      {pages.map((p, i) =>
        p < 0 ? (
          <span
            key={`ell-${i}`}
            className="w-9 h-9 flex items-center justify-center text-muted-foreground text-sm"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl(p)}
            className={cn(
              "w-9 h-9 rounded-md border text-sm font-medium flex items-center justify-center transition-colors",
              p === currentPage
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages && (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
