import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin/orders-data";
import { ORDER_STATUSES } from "@/lib/admin/types";
import { updateOrderStatus } from "./actions";

export const metadata: Metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const updateStatusWithId = updateOrderStatus.bind(null, order.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Order — {order.customer_name}
        </h1>
        <Link
          href={`/admin/orders/${order.id}/invoice`}
          className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/[.04]"
        >
          Print invoice
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">Customer</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Name" value={order.customer_name} />
            <Row label="Phone" value={order.customer_phone} />
            <Row label="Email" value={order.customer_email ?? "—"} />
            <Row label="Address" value={`${order.delivery_address}, ${order.city}`} />
            <Row label="Notes" value={order.notes ?? "—"} />
            <Row label="Placed" value={new Date(order.created_at).toLocaleString()} />
          </dl>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">Status</h2>
          <form action={updateStatusWithId} className="flex flex-col gap-3">
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm capitalize"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Update status
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Items</h2>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="py-2">Item</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Unit price</th>
              <th className="py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-black/5 last:border-0">
                <td className="py-2">
                  {item.product_name}
                  {item.variant_label ? ` (${item.variant_label})` : ""}
                </td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">${item.unit_price.toFixed(2)}</td>
                <td className="py-2">${item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end border-t border-black/10 pt-4 text-lg font-bold">
          Total: ${order.total_amount.toFixed(2)}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
