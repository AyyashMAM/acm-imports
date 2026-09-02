"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";
import { placeOrder } from "@/app/checkout/actions";
import type { Profile } from "@/lib/account/profile-data";
import type { Address } from "@/lib/account/addresses-data";

export function CheckoutForm({
  profile,
  addresses,
}: {
  profile: Profile | null;
  addresses: Address[];
}) {
  const { items, totalPrice, shippingFee, grandTotal } = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, null);

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id ?? "");
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

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

          {addresses.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium">Saved address</label>
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Enter a new address below</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label || a.recipient_name} — {a.address_line}, {a.city}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Field
            label="Full name"
            name="customerName"
            required
            defaultValue={selectedAddress?.recipient_name ?? profile?.full_name ?? ""}
          />
          <Field
            label="Phone number"
            name="customerPhone"
            type="tel"
            required
            defaultValue={selectedAddress?.phone ?? profile?.phone ?? ""}
          />
          <Field
            label="Email (optional)"
            name="customerEmail"
            type="email"
            defaultValue={profile?.email ?? ""}
          />
          <Field
            label="Delivery address"
            name="deliveryAddress"
            required
            defaultValue={selectedAddress?.address_line ?? ""}
          />
          <Field label="City" name="city" required defaultValue={selectedAddress?.city ?? ""} />
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
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Shipping</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
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
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        key={defaultValue}
        className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
      />
    </div>
  );
}
