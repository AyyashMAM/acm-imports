"use client";

import { useState } from "react";

export function SalePriceField({
  defaultIsOnSale,
  defaultSalePrice,
}: {
  defaultIsOnSale: boolean;
  defaultSalePrice: number | null;
}) {
  const [isOnSale, setIsOnSale] = useState(defaultIsOnSale);

  return (
    <div>
      <label className="mb-1 flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="is_on_sale"
          defaultChecked={defaultIsOnSale}
          onChange={(e) => setIsOnSale(e.target.checked)}
        />
        Discount currently active
      </label>
      {isOnSale && (
        <div className="mt-2">
          <label className="mb-1 block text-sm font-medium">Sale price (LKR)</label>
          <input
            name="sale_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultSalePrice ?? ""}
            required
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}
