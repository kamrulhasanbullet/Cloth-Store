"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import type { ProductImage } from "@/lib/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const primary = images[active];

  return (
    <>
      <div className="flex gap-4">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-2 w-20">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActive(i)}
                className={cn(
                  "relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                  i === active
                    ? "border-foreground"
                    : "border-border hover:border-muted-foreground",
                )}
              >
                <Image
                  src={getImageUrl(img.url, 200)}
                  alt={img.alt_text || productName}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 relative group">
          <div
            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={getImageUrl(primary?.url ?? "", 900)}
              alt={primary?.alt_text || productName}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute top-4 right-4 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={16} />
            </div>
          </div>

          {/* Mobile thumbnail arrows */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3 md:hidden">
              <button
                onClick={() =>
                  setActive((active - 1 + images.length) % images.length)
                }
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-muted-foreground">
                {active + 1} / {images.length}
              </span>
              <button
                onClick={() => setActive((active + 1) % images.length)}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-screen w-full h-full flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(primary?.url ?? "", 1200)}
              alt={primary?.alt_text || productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
            >
              &times;
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActive((active - 1 + images.length) % images.length)
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActive((active + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
