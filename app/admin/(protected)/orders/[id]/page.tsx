import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin/orders-data";
import { formatPrice } from "@/lib/currency";
import { OrderConfirmCancel } from "@/components/admin/order-confirm-cancel";
import { CancelOrderButton } from "@/components/admin/cancel-order-button";
import { updateOrderStatus } from "./actions";

export const metadata: Metadata = { title: "Order detail" };

// Confirm/Cancel are dedicated actions (they carry side effects — a
// notification, and for Cancel, a stock restore + required reason), so the
// generic dropdown only ever offers the stages after that decision has been
// made.
const POST_CONFIRMATION_STATUSES = ["confirmed", "processing", "shipped", "delivered"] as const;

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const updateStatusWithId = updateOrderStatus.bind(null, order.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900">
            Order #{order.order_number}
          </h1>
          <p className="text-sm text-zinc-500">{order.customer_name}</p>
        </div>
        <Link
          href={`/admin/orders/${order.id}/invoice`}
          prefetch={false}
          className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/[.04]"
        >
          Print invoice
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-3 font-display text-lg font-semibold text-zinc-900">Customer</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Name" value={order.customer_name} />
            <Row label="Phone" value={order.customer_phone} />
            <Row label="Email" value={order.customer_email ?? "—"} />
            <Row label="Address" value={`${order.delivery_address}, ${order.city}`} />
            <Row label="Notes" value={order.notes ?? "—"} />
            <Row label="Placed" value={new Date(order.created_at).toLocaleString()} />
          </dl>
          {order.user_id && (
            <Link
              href={`/admin/customers/${order.user_id}`}
              prefetch={false}
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              View customer account →
            </Link>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-3 font-display text-lg font-semibold text-zinc-900">Status</h2>

          {order.status === "pending" ? (
            <OrderConfirmCancel orderId={order.id} />
          ) : order.status === "cancelled" ? (
            <div className="text-sm">
              <span className="rounded-full bg-zinc-200 px-3 py-1.5 font-bold text-zinc-600">
                Cancelled
              </span>
              {order.cancellation_reason && (
                <p className="mt-2 text-zinc-500">Reason: {order.cancellation_reason}</p>
              )}
            </div>
          ) : (
            <form action={updateStatusWithId} className="flex flex-col gap-3">
              <select
                name="status"
                defaultValue={order.status}
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm capitalize"
              >
                {POST_CONFIRMATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Courier</label>
                  <input
                    name="courier_name"
                    defaultValue={order.courier_name ?? ""}
                    placeholder="e.g. Domex"
                    className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Tracking number</label>
                  <input
                    name="tracking_number"
                    defaultValue={order.tracking_number ?? ""}
                    className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Courier/tracking are only saved when status is set to Shipped.
              </p>
              <button
                type="submit"
                className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark"
              >
                Update status
              </button>
            </form>
          )}

          {order.status !== "pending" && order.status !== "cancelled" && order.status !== "delivered" && (
            <div className="mt-4 border-t border-black/10 pt-4">
              <CancelOrderButton orderId={order.id} />
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-zinc-900">Items</h2>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
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
                <td className="py-2 font-mono">{formatPrice(item.unit_price)}</td>
                <td className="py-2 font-mono">{formatPrice(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="mt-4 flex flex-col items-end gap-1 border-t border-black/10 pt-4 text-sm">
          <div className="flex gap-4 text-zinc-500">
            <span>Shipping</span>
            <span className="w-28 text-right font-mono">{formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex gap-4 text-lg font-bold">
            <span>Total</span>
            <span className="w-28 text-right font-mono">{formatPrice(order.total_amount)}</span>
          </div>
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
