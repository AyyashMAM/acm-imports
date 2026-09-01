"use client";

import { useState } from "react";
import { computeMargin, formatPrice } from "@/lib/currency";

export function VariantPriceFields({
  defaultPrice,
  defaultCostPrice,
}: {
  defaultPrice?: number;
  defaultCostPrice?: number | null;
}) {
  const [price, setPrice] = useState(defaultPrice ?? 0);
  const [costPrice, setCostPrice] = useState<number | null>(defaultCostPrice ?? null);

  const margin = computeMargin(price, costPrice);
  const atLoss = margin !== null && margin.amount < 0;

  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium">Sell price (LKR)</label>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultPrice}
          required
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">Cost price (LKR)</label>
        <input
          name="cost_price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultCostPrice ?? ""}
          onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">Margin</label>
        <div
          className={`flex h-[34px] items-center rounded-md border px-2 text-sm font-semibold ${
            margin === null
              ? "border-black/10 text-zinc-400"
              : atLoss
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {margin === null ? "—" : `${formatPrice(margin.amount)} · ${margin.percent.toFixed(1)}%`}
        </div>
        {atLoss && <p className="mt-1 text-xs font-semibold text-red-600">Selling at a loss</p>}
      </div>
    </>
  );
}
