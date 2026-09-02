"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function BrandFilter({ brands }: { brands: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeBrand = searchParams.get("brand") ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("brand", e.target.value);
    } else {
      params.delete("brand");
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  return (
    <select
      value={activeBrand}
      onChange={handleChange}
      aria-label="Filter by brand"
      className="rounded-full border border-black/10 bg-zinc-100 px-4 py-1.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-brand/20"
    >
      <option value="">All brands</option>
      {brands.map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
    </select>
  );
}
