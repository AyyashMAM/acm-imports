"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const variants = product.product_variants;
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const variant = variants.find((v) => v.id === variantId);
  const image = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];

  if (!variant) {
    return <p className="text-sm text-zinc-500">Currently unavailable.</p>;
  }

  const outOfStock = variant.stock_quantity <= 0;

  const handleAdd = () => {
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantLabel: variant.label,
      price: variant.price,
      quantity,
      imageUrl: image?.url ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      {variants.length > 1 && (
        <div>
          <label className="mb-1 block text-sm font-medium">Option</label>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock_quantity <= 0}>
                {v.label} — ${v.price.toFixed(2)}
                {v.stock_quantity <= 0 ? " (out of stock)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="text-3xl font-extrabold text-brand">${variant.price.toFixed(2)}</p>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Qty</label>
        <input
          type="number"
          min={1}
          max={variant.stock_quantity}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Number(e.target.value) || 1))
          }
          className="w-20 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex-1 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {outOfStock ? "Out of stock" : added ? "Added!" : "Add to cart"}
        </button>
        <button
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
          disabled={outOfStock}
          className="flex-1 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
