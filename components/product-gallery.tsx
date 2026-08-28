"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [activeId, setActiveId] = useState(images[0]?.id ?? null);
  const active = images.find((img) => img.id === activeId) ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
        {active ? (
          <Image
            src={active.url}
            alt={productName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No image
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              aria-label={`Show image ${img.sort_order + 1}`}
              aria-pressed={img.id === active?.id}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-2 transition-colors ${
                img.id === active?.id ? "ring-brand" : "ring-transparent hover:ring-black/10"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
