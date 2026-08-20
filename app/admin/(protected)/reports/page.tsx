import type { Metadata } from "next";
import Link from "next/link";
import { getSalesReport, REPORT_RANGES, type ReportRange } from "@/lib/admin/reports-data";

export const metadata: Metadata = { title: "Reports" };

export default async function AdminReportsPage({
  searchParams,
}: PageProps<"/admin/reports">) {
  const { range } = await searchParams;
  const rangeParam = Array.isArray(range) ? range[0] : range;
  const activeRange: ReportRange = REPORT_RANGES.some((r) => r.value === rangeParam)
    ? (rangeParam as ReportRange)
    : "30d";

  const report = await getSalesReport(activeRange);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Sales &amp; profit</h1>

      <div className="flex flex-wrap gap-2">
        {REPORT_RANGES.map((r) => (
          <Link
            key={r.value}
            href={`/admin/reports?range=${r.value}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              activeRange === r.value
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Revenue" value={`$${report.revenue.toFixed(2)}`} />
        <Stat label="Cost" value={`$${report.cost.toFixed(2)}`} />
        <Stat label="Profit" value={`$${report.profit.toFixed(2)}`} highlight />
        <Stat label="Orders" value={String(report.orderCount)} />
      </div>

      <p className="text-xs text-zinc-500">
        Excludes cancelled orders. Items without a cost price are counted as $0 cost, which
        can overstate profit until costs are filled in on each product variant.
      </p>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {report.orders.map((order) => (
              <tr key={order.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-semibold hover:text-brand"
                  >
                    {order.customer_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 capitalize">{order.status}</td>
                <td className="px-4 py-3">${order.total_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {report.orders.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No orders in this range.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-extrabold ${highlight ? "text-brand" : ""}`}>
        {value}
      </p>
    </div>
  );
}
