import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMyOrderById } from "@/lib/account/orders-data";
import { formatPrice } from "@/lib/currency";
import type { OrderStatus } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Order detail" };

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-zinc-200 text-zinc-600",
};

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

export default async function AccountOrderDetailPage({
  params,
}: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const order = await getMyOrderById(id);
  if (!order) notFound();

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Order #{order.id.slice(0, 8)}
        </h1>
        <p className="text-sm text-zinc-500">
          Placed {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Status</h2>
        {order.status === "cancelled" ? (
          <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${STATUS_STYLES.cancelled}`}>
            Cancelled
          </span>
        ) : (
          <ol className="flex flex-wrap gap-3">
            {STATUS_STEPS.map((step, i) => (
              <li
                key={step}
                className={`rounded-full px-3 py-1.5 text-sm font-bold capitalize ${
                  i <= currentStep ? STATUS_STYLES[step] : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {step}
              </li>
            ))}
          </ol>
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
        <div className="mt-4 flex justify-end border-t border-black/10 pt-4 text-lg font-bold">
          Total paid: {formatPrice(order.total_amount)}
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
