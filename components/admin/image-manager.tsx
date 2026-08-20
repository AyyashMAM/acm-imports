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

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!res.ok) {
      setError("Upload failed. Try a smaller image file.");
      return;
    }
    router.refresh();
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...sorted];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    startTransition(async () => {
      await reorderProductImages(productId, next.map((img) => img.id));
      router.refresh();
    });
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
          <div key={image.id} className="flex flex-col gap-1">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
              <Image src={image.url} alt="" fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || isPending}
                  className="rounded border border-black/10 px-1.5 py-0.5 disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === sorted.length - 1 || isPending}
                  className="rounded border border-black/10 px-1.5 py-0.5 disabled:opacity-30"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(image.id)}
                disabled={isPending}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="text-sm"
        />
        {uploading && <p className="mt-1 text-xs text-zinc-500">Uploading...</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
