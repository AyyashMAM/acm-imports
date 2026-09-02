"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, shippingFee, grandTotal } = useCart();

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
          <li key={item.variantId} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-4">
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
              <div className="min-w-0 flex-1 sm:flex-none">
                <p className="truncate font-medium">{item.productName}</p>
                <p className="text-sm text-zinc-500">{item.variantLabel}</p>
                <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:ml-auto sm:justify-end">
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
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-2 border-t border-black/10 pt-6 text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Subtotal</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Shipping</span>
          <span>{formatPrice(shippingFee)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 text-lg font-semibold">
          <span>Total: {formatPrice(grandTotal)}</span>
          <Link
            href="/checkout"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-[#383838]"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
