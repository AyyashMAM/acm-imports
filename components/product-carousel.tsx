"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export function ProductCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="group relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc(50%-0.75rem)] shrink-0 snap-start sm:w-[calc(25%-1.125rem)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {products.length > 4 && (
        <>
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Previous products"
            className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-bold text-zinc-900 opacity-0 shadow-lg transition-opacity hover:bg-zinc-50 group-hover:opacity-100 sm:flex"
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Next products"
            className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-bold text-zinc-900 opacity-0 shadow-lg transition-opacity hover:bg-zinc-50 group-hover:opacity-100 sm:flex"
          >
            &rsaquo;
          </button>
        </>
      )}
    </div>
  );
}
