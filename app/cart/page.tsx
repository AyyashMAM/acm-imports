"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">
          Your cart is empty
        </h1>
        <Link
          href="/products"
          className="inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-[#383838]"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Your Cart</h1>
      <ul className="flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              <p className="text-sm text-zinc-500">{item.variantLabel}</p>
              <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(
                  item.variantId,
                  Math.max(1, Number(e.target.value) || 1)
                )
              }
              className="w-16 rounded-md border border-black/15 bg-transparent px-2 py-1 text-sm"
            />
            <button
              onClick={() => removeItem(item.variantId)}
              className="text-sm text-zinc-500 hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
        <p className="text-lg font-semibold">Total: {formatPrice(totalPrice)}</p>
        <Link
          href="/checkout"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-[#383838]"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
