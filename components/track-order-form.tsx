"use client";

import { useActionState } from "react";
import { OrderStatusTimeline } from "@/components/order-status-timeline";
import { formatPrice } from "@/lib/currency";
import { trackOrder, type TrackOrderState } from "@/app/track-order/actions";

export function TrackOrderForm({ initialOrderNumber }: { initialOrderNumber?: string }) {
  const [state, formAction, pending] = useActionState<TrackOrderState, FormData>(
    trackOrder,
    null
  );

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Order number</label>
          <input
            name="order_number"
            required
            defaultValue={initialOrderNumber}
            placeholder="LIORA-2026-00123"
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm uppercase"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone number</label>
          <input
            name="phone"
            type="tel"
            required
            placeholder="The number used at checkout"
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Looking up..." : "Track order"}
        </button>
      </form>

      {state && "order" in state && (
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">
              Order #{state.order.order_number}
            </h2>
            <OrderStatusTimeline status={state.order.status} />
            {state.order.status === "cancelled" && state.order.cancellation_reason && (
              <p className="mt-3 text-sm text-zinc-500">
                Reason: {state.order.cancellation_reason}
              </p>
            )}
            {state.order.tracking_number && (
              <p className="mt-3 text-sm text-zinc-600">
                Courier: <strong>{state.order.courier_name ?? "—"}</strong> · Tracking:{" "}
                <strong>{state.order.tracking_number}</strong>
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">Items</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {state.order.order_items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name}
                    {item.variant_label ? ` (${item.variant_label})` : ""} x{item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span>{formatPrice(state.order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total (cash on delivery)</span>
                <span>{formatPrice(state.order.total_amount)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-zinc-600">
            Delivering to <strong>{state.order.city}</strong>
          </section>
        </div>
      )}
    </div>
  );
}
