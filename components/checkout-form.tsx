"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";
import { placeOrder } from "@/app/checkout/actions";
import { SRI_LANKA_CITIES, ALL_SRI_LANKA_CITIES } from "@/lib/sri-lanka-cities";
import type { Profile } from "@/lib/account/profile-data";
import type { Address } from "@/lib/account/addresses-data";

const inputClass =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15";

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
    <div className="bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
            Almost there
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Cash on delivery — pay when your order arrives at your door.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="mb-5 text-lg font-bold">Delivery details</h2>
            <form action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="cart" value={cartPayload} />

              {addresses.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Saved address</label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className={inputClass}
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
              <div>
                <Field
                  label="Phone number"
                  name="customerPhone"
                  type="tel"
                  required
                  defaultValue={selectedAddress?.phone ?? profile?.phone ?? ""}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  We&apos;ll text your order confirmation to this number, so make sure it&apos;s correct.
                </p>
              </div>
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
              <CityField key={selectedAddress?.city ?? ""} defaultValue={selectedAddress?.city ?? ""} />
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-light px-4 py-3 text-sm">
                <span className="text-xl">💵</span>
                <p>
                  Payment method: <strong>Cash on delivery</strong>. Pay when your
                  order arrives — no online payment needed.
                </p>
              </div>

              {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-2 w-full rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-transform hover:scale-[1.01] hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {pending ? "Placing order..." : `Place order · ${formatPrice(grandTotal)}`}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg font-bold">Order summary</h2>
            <ul className="flex flex-col gap-4 text-sm">
              {items.map((item) => (
                <li key={item.variantId} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.productName}</p>
                    <p className="text-xs text-zinc-500">{item.variantLabel}</p>
                  </div>
                  <span className="shrink-0 font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-bold">
                <span>Total</span>
                <span className="text-brand">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
              <span>🔒</span> No payment needed now — pay cash when it arrives.
            </p>
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
      <label className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        key={defaultValue}
        className={inputClass}
      />
    </div>
  );
}

const OTHER_CITY = "__other__";

function CityField({ defaultValue }: { defaultValue: string }) {
  const isKnownCity = defaultValue !== "" && ALL_SRI_LANKA_CITIES.includes(defaultValue);
  const [isOther, setIsOther] = useState(defaultValue !== "" && !isKnownCity);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        City <span className="text-brand">*</span>
      </label>
      <select
        name={isOther ? undefined : "city"}
        required={!isOther}
        defaultValue={isOther ? OTHER_CITY : defaultValue}
        onChange={(e) => setIsOther(e.target.value === OTHER_CITY)}
        className={inputClass}
      >
        <option value="" disabled>
          Select your city
        </option>
        {SRI_LANKA_CITIES.map((group) => (
          <optgroup key={group.district} label={group.district}>
            {group.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={OTHER_CITY}>Other (not listed)</option>
      </select>
      {isOther && (
        <input
          type="text"
          name="city"
          required
          defaultValue={isKnownCity ? "" : defaultValue}
          placeholder="Enter your city/town"
          className={`${inputClass} mt-2`}
        />
      )}
    </div>
  );
}
