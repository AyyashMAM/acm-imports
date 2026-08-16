"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, null);

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

  const cartPayload = JSON.stringify(
    items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
  );

  return (
    <div className="mx-auto grid max-w-3xl gap-10 px-6 py-12 sm:grid-cols-2">
      <div>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="cart" value={cartPayload} />

          <Field label="Full name" name="customerName" required />
          <Field label="Phone number" name="customerPhone" type="tel" required />
          <Field label="Email (optional)" name="customerEmail" type="email" />
          <Field label="Delivery address" name="deliveryAddress" required />
          <Field label="City" name="city" required />
          <div>
            <label className="mb-1 block text-sm font-medium">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm">
            Payment method: <strong>Cash on delivery</strong>. Pay when your
            order arrives.
          </p>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-[#383838] disabled:opacity-50"
          >
            {pending ? "Placing order..." : "Place order"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
        <ul className="flex flex-col gap-3 text-sm">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between">
              <span>
                {item.productName} ({item.variantLabel}) x{item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-black/10 pt-4 font-semibold">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
      />
    </div>
  );
}
