"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { AdminProductImage } from "@/lib/admin/types";
import { deleteProductImage, reorderProductImages } from "@/app/admin/(protected)/products/[id]/actions";

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: AdminProductImage[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    let failed = false;
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) failed = true;
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (failed) setError("Some images failed to upload. Try a smaller image file.");
    router.refresh();
  };

  const reorderTo = (next: AdminProductImage[]) => {
    startTransition(async () => {
      await reorderProductImages(productId, next.map((img) => img.id));
      router.refresh();
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...sorted];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorderTo(next);
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...sorted];
    const [image] = next.splice(index, 1);
    next.unshift(image);
    reorderTo(next);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...sorted];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, dragged);
    setDragIndex(null);
    reorderTo(next);
  };

  const remove = (imageId: string) => {
    startTransition(async () => {
      await deleteProductImage(imageId, productId);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {sorted.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(index);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`flex cursor-grab flex-col gap-1.5 active:cursor-grabbing ${
              dragIndex === index ? "opacity-40" : ""
            }`}
          >
            <div className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-black/5">
              <Image src={image.url} alt="" fill className="object-cover" draggable={false} />
              {index === 0 ? (
                <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  disabled={isPending}
                  className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80 disabled:cursor-not-allowed"
                >
                  Set as cover
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || isPending}
                  aria-label="Move left"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-black/10 text-zinc-600 transition-colors hover:bg-black/[.04] disabled:opacity-30"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M7.5 2.5 3 6l4.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === sorted.length - 1 || isPending}
                  aria-label="Move right"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-black/10 text-zinc-600 transition-colors hover:bg-black/[.04] disabled:opacity-30"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 2.5 9 6l-4.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(image.id)}
                disabled={isPending}
                aria-label="Delete image"
                className="flex h-6 w-6 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3.5 4.5h9M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M6.5 7.5v4M9.5 7.5v4M4.5 4.5l.6 8.1a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand hover:text-brand-dark disabled:opacity-50"
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 13.5V15a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 15v-1.5M10 12.5V4M10 4 6.5 7.5M10 4l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {uploading ? "Uploading..." : "Add image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        {sorted.length > 1 && (
          <p className="mt-1.5 text-xs text-zinc-400">Drag a photo to reorder it.</p>
        )}
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
