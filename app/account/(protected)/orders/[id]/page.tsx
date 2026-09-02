import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMyOrderById } from "@/lib/account/orders-data";
import { formatPrice } from "@/lib/currency";
import { OrderStatusTimeline } from "@/components/order-status-timeline";

export const metadata: Metadata = { title: "Order detail" };

export default async function AccountOrderDetailPage({
  params,
}: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const order = await getMyOrderById(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Order #{order.order_number}
        </h1>
        <p className="text-sm text-zinc-500">
          Placed {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Status</h2>
        <OrderStatusTimeline status={order.status} />
        {order.status === "cancelled" && order.cancellation_reason && (
          <p className="mt-3 text-sm text-zinc-500">Reason: {order.cancellation_reason}</p>
        )}
        {order.tracking_number && (
          <p className="mt-3 text-sm text-zinc-600">
            Courier: <strong>{order.courier_name ?? "—"}</strong> · Tracking:{" "}
            <strong>{order.tracking_number}</strong>
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Items</h2>
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
                  <td className="py-2">{formatPrice(item.unit_price)}</td>
                  <td className="py-2">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-col items-end gap-1 border-t border-black/10 pt-4 text-sm">
          <div className="flex gap-4 text-zinc-500">
            <span>Shipping</span>
            <span className="w-28 text-right">{formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex gap-4 text-lg font-bold">
            <span>Total paid</span>
            <span className="w-28 text-right">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-3 text-lg font-bold">Shipping to</h2>
        <p className="text-sm text-zinc-600">
          {order.customer_name} — {order.customer_phone}
          <br />
          {order.delivery_address}, {order.city}
        </p>
      </section>
    </div>
  );
}
