import type { Metadata } from "next";
import Link from "next/link";
import { getOverviewStats } from "@/lib/admin/overview-data";
import { SalesChart } from "@/components/admin/sales-chart";
import { formatPrice } from "@/lib/currency";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminDashboardPage() {
  const stats = await getOverviewStats();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Overview</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total sales" value={formatPrice(stats.totalRevenue)} />
        <Stat label="Total orders" value={String(stats.totalOrders)} />
        <Link href="/admin/orders?status=pending" className="contents">
          <Stat label="Pending orders" value={String(stats.pendingOrders)} highlight />
        </Link>
        <Link href="/admin/stock" className="contents">
          <Stat
            label="Low / out of stock"
            value={String(stats.lowStock.length + stats.outOfStock.length)}
          />
        </Link>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Sales — last 30 days</h2>
        <SalesChart data={stats.dailySales} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Out of stock</h2>
          {stats.outOfStock.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing out of stock.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {stats.outOfStock.map((row) => (
                <li key={row.variant.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/products/${row.product.id}`}
                    prefetch={false}
                    className="hover:text-brand"
                  >
                    {row.product.name} — {row.variant.label}
                  </Link>
                  <span className="shrink-0 font-semibold text-red-600">Out</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Low stock</h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing low on stock.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {stats.lowStock.map((row) => (
                <li key={row.variant.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/products/${row.product.id}`}
                    prefetch={false}
                    className="hover:text-brand"
                  >
                    {row.product.name} — {row.variant.label}
                  </Link>
                  <span className="shrink-0 font-semibold text-amber-600">
                    {row.variant.stock_quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
    <div className="rounded-2xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${highlight ? "text-brand" : ""}`}>{value}</p>
    </div>
  );
}
