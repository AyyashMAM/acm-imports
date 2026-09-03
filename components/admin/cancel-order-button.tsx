"use client";

import { useState, useTransition } from "react";
import { cancelOrder } from "@/app/admin/(protected)/orders/[id]/actions";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleCancel = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await cancelOrder(orderId, formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not cancel order");
      }
    });
  };

  if (showForm) {
    return (
      <form action={handleCancel} className="flex flex-col gap-2">
        <textarea
          name="reason"
          required
          placeholder="Reason for cancelling (shown to the customer)"
          rows={2}
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "Cancelling..." : "Confirm cancellation"}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
          >
            Back
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setShowForm(true)}
        disabled={pending}
        className="w-fit rounded-full border border-red-200 px-5 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Cancel order
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
