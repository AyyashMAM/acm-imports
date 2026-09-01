"use client";

import { useRef, useState } from "react";

type PreviewFile = { file: File; url: string; key: string };

function buildPreviews(files: File[]): PreviewFile[] {
  return files.map((file, i) => ({
    file,
    url: URL.createObjectURL(file),
    key: `${file.name}-${file.lastModified}-${file.size}-${i}`,
  }));
}

export function ProductImageInput({ name = "images" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);

  const syncInputFiles = (files: File[]) => {
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    if (inputRef.current) inputRef.current.files = dt.files;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    if (newFiles.length === 0) return;
    setPreviews((prev) => {
      const merged = [...prev.map((p) => p.file), ...newFiles];
      syncInputFiles(merged);
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return buildPreviews(merged);
    });
  };

  const removeAt = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      const next = prev.filter((_, i) => i !== index);
      syncInputFiles(next.map((p) => p.file));
      return next;
    });
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Product images</label>
      {previews.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-black/15 bg-zinc-50/50 p-4 text-left transition-colors hover:border-brand hover:bg-brand-light/30"
        >
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
        </button>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-black/15 bg-zinc-50/50 p-3">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {previews.map((p, i) => (
              <div key={p.key} className="flex flex-col gap-1">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Cover
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Remove image"
                  className="flex items-center justify-center gap-1 rounded-md py-1 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 4.5h9M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M6.5 7.5v4M9.5 7.5v4M4.5 4.5l.6 8.1a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.1"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-black/15 text-zinc-400 transition-colors hover:border-brand hover:text-brand-dark"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-semibold">Add more</span>
            </button>
          </div>
        </div>
      )}
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
