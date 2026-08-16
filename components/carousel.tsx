"use client";

import { useCallback, useEffect, useState } from "react";

type CarouselProps = {
  children: React.ReactNode[];
  autoPlayMs?: number;
  className?: string;
  theme?: "light" | "dark";
};

export function Carousel({
  children,
  autoPlayMs,
  className,
  theme = "dark",
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const count = children.length;
  const isLight = theme === "light";

  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (!autoPlayMs || count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), autoPlayMs);
    return () => clearInterval(id);
  }, [autoPlayMs, count]);

  if (count === 0) return null;

  return (
    <div className={`group relative overflow-hidden ${className ?? ""}`}>
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {children.map((child, i) => (
          <div key={i} className="w-full shrink-0">
            {child}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className={`absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lg font-bold opacity-0 shadow transition-opacity group-hover:opacity-100 ${
              isLight
                ? "bg-white/90 text-zinc-900 hover:bg-white"
                : "bg-white/80 text-zinc-900 hover:bg-white"
            }`}
          >
            &lsaquo;
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-lg font-bold opacity-0 shadow transition-opacity group-hover:opacity-100 ${
              isLight
                ? "bg-white/90 text-zinc-900 hover:bg-white"
                : "bg-white/80 text-zinc-900 hover:bg-white"
            }`}
          >
            &rsaquo;
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {children.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  isLight
                    ? i === index
                      ? "w-6 bg-zinc-900"
                      : "w-2 bg-zinc-900/30"
                    : i === index
                      ? "w-6 bg-white"
                      : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
