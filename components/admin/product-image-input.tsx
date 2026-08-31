"use client";

import { useRef, useState } from "react";

export function ProductImageInput({ name = "images" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; key: string }[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return files.map((file, i) => ({ url: URL.createObjectURL(file), key: `${file.name}-${i}` }));
    });
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Product images</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl border-2 border-dashed border-black/15 bg-zinc-50/50 p-4 text-left transition-colors hover:border-brand hover:bg-brand-light/30"
      >
        {previews.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-dark">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 13.5V15a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 15v-1.5M10 12.5V4M10 4 6.5 7.5M10 4l3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-sm font-semibold text-zinc-700">Click to upload photos</p>
            <p className="text-xs text-zinc-400">PNG or JPG, up to 5MB each — first image becomes the cover</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {previews.map((p, i) => (
              <div key={p.key} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
