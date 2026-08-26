"use client";

import { useActionState, useState } from "react";
import { adjustStockAction, type AdjustStockState } from "@/app/admin/(protected)/stock/actions";

export function StockAdjustForm({ variantId }: { variantId: string }) {
  const [state, formAction, pending] = useActionState<AdjustStockState, FormData>(
    adjustStockAction,
    null
  );
  const [open, setOpen] = useState(false);
  const [lastHandledState, setLastHandledState] = useState(state);

  // Close the form once a submission succeeds. Deriving this during render
  // (rather than in a useEffect) avoids an extra post-commit render pass.
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state && "success" in state && open) setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-bold hover:bg-black/[.04]"
      >
        Adjust stock
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="variant_id" value={variantId} />
      <div>
        <label className="mb-1 block text-xs font-medium">Amount (+/-)</label>
        <input
          name="delta"
          type="number"
          required
          placeholder="e.g. -2 or 10"
          className="w-28 rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">Reason</label>
        <input
          name="reason"
          required
          placeholder="e.g. Damaged, restock"
          className="w-48 rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800"
      >
        Cancel
      </button>
      {state && "error" in state && (
        <p className="w-full text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
