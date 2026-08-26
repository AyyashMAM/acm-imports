import type { Metadata } from "next";
import Link from "next/link";
import {
  getStockRows,
  getRecentAdjustments,
  getDefaultLowStockThreshold,
  type StockStatus,
} from "@/lib/admin/stock-data";
import { StockAdjustForm } from "@/components/admin/stock-adjust-form";
import { updateDefaultThreshold } from "./actions";

export const metadata: Metadata = { title: "Stock" };

const STATUS_STYLES: Record<StockStatus, string> = {
  in_stock: "bg-green-100 text-green-700",
  low: "bg-amber-100 text-amber-700",
  out: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

export default async function AdminStockPage() {
  const [rows, adjustments, defaultThreshold] = await Promise.all([
    getStockRows(),
    getRecentAdjustments(),
    getDefaultLowStockThreshold(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Stock</h1>
        <form action={updateDefaultThreshold} className="flex items-center gap-2 text-sm">
          <label htmlFor="low_stock_threshold" className="font-medium text-zinc-500">
            Default low-stock threshold
          </label>
          <input
            id="low_stock_threshold"
            name="low_stock_threshold"
            type="number"
            min={0}
            defaultValue={defaultThreshold}
            className="w-20 rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-bold hover:bg-black/[.04]"
          >
            Save
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/10 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variant.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${row.product.id}`}
                    prefetch={false}
                    className="font-semibold hover:text-brand"
                  >
                    {row.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">{row.variant.label}</td>
                <td className="px-4 py-3 font-semibold">{row.variant.stock_quantity}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[row.status]}`}
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StockAdjustForm variantId={row.variant.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">No variants yet.</p>
        )}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Recent adjustments</h2>
        {adjustments.length === 0 ? (
          <p className="text-sm text-zinc-500">No manual adjustments logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-black/10 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="py-2">Product</th>
                  <th className="py-2">Change</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((a) => (
                  <tr key={a.id} className="border-b border-black/5 last:border-0">
                    <td className="py-2">
                      {a.product_name} — {a.variant_label}
                    </td>
                    <td className={`py-2 font-semibold ${a.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                      {a.delta > 0 ? `+${a.delta}` : a.delta}
                    </td>
                    <td className="py-2 text-zinc-500">{a.reason}</td>
                    <td className="py-2 text-zinc-500">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
