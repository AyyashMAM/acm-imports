import type { Metadata } from "next";
import Link from "next/link";
import { getOverviewStats } from "@/lib/admin/overview-data";
import { SalesChart } from "@/components/admin/sales-chart";
import { OrderConfirmCancel } from "@/components/admin/order-confirm-cancel";
import { formatPrice } from "@/lib/currency";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminDashboardPage() {
  const stats = await getOverviewStats();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900">Overview</h1>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-amber-900">
          Needs action — {stats.pendingQueue.length} order
          {stats.pendingQueue.length === 1 ? "" : "s"} awaiting confirmation
        </h2>
        {stats.pendingQueue.length === 0 ? (
          <p className="text-sm text-amber-800/70">Nothing waiting on you right now.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {stats.pendingQueue.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="text-sm">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    prefetch={false}
                    className="font-bold hover:text-brand"
                  >
                    #{order.order_number}
                  </Link>
                  <p className="mt-1 font-semibold">{order.customer_name}</p>
                  <p className="text-zinc-500">{order.customer_phone}</p>
                  <p className="mt-1 text-zinc-500">
                    {order.order_items.length} item{order.order_items.length === 1 ? "" : "s"} ·{" "}
                    <span className="font-mono">{formatPrice(order.total_amount)}</span>
                  </p>
                </div>
                <OrderConfirmCancel orderId={order.id} />
              </div>
            ))}
          </div>
        )}
      </div>

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
        <h2 className="mb-4 font-display text-lg font-semibold text-zinc-900">Sales — last 30 days</h2>
        <SalesChart data={stats.dailySales} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-zinc-900">Out of stock</h2>
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
          <h2 className="mb-4 font-display text-lg font-semibold text-zinc-900">Low stock</h2>
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
      <p className={`mt-1 font-mono text-2xl font-semibold ${highlight ? "text-brand" : ""}`}>{value}</p>
    </div>
  );
}
