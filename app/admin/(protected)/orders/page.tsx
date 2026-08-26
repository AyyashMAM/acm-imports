import type { Metadata } from "next";
import Link from "next/link";
import { getOrders } from "@/lib/admin/orders-data";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/types";
import { formatPrice } from "@/lib/currency";

export const metadata: Metadata = { title: "Orders" };

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-zinc-200 text-zinc-600",
};

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const { status } = await searchParams;
  const activeStatus = Array.isArray(status) ? status[0] : status;
  const orders = await getOrders(
    activeStatus && ORDER_STATUSES.includes(activeStatus as OrderStatus)
      ? (activeStatus as OrderStatus)
      : undefined
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Orders</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          prefetch={false}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            !activeStatus ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            prefetch={false}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
              activeStatus === s ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/10 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-black/5 last:border-0 hover:bg-zinc-50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    prefetch={false}
                    className="font-semibold hover:text-brand"
                  >
                    {order.customer_name}
                  </Link>
                  {order.user_id ? (
                    <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold uppercase text-brand-dark">
                      Account
                    </span>
                  ) : (
                    <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-500">
                      Guest
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">{order.city}</td>
                <td className="px-4 py-3">{formatPrice(order.total_amount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No orders here.
          </p>
        )}
      </div>
    </div>
  );
}
