import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/admin/orders-data";
import { SITE_NAME } from "@/lib/seo";
import { formatPrice } from "@/lib/currency";
import { PrintButton } from "@/components/admin/print-button";
import { STATUS_LABELS } from "@/lib/order-status";

export const metadata: Metadata = { title: "Invoice" };

export default async function AdminOrderInvoicePage({
  params,
}: PageProps<"/admin/orders/[id]/invoice">) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white p-10 print:border-0 print:p-0 print:shadow-none">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{SITE_NAME}</h1>
          <p className="text-sm text-zinc-500">Cash on delivery invoice</p>
        </div>
        <PrintButton />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="mb-1 font-semibold text-zinc-500">Bill to</p>
          <p className="font-medium">{order.customer_name}</p>
          <p>{order.customer_phone}</p>
          <p>
            {order.delivery_address}, {order.city}
          </p>
        </div>
        <div className="text-right">
          <p>
            <span className="text-zinc-500">Order #: </span>
            {order.order_number}
          </p>
          <p>
            <span className="text-zinc-500">Date: </span>
            {new Date(order.created_at).toLocaleDateString()}
          </p>
          <p>
            <span className="text-zinc-500">Status: </span>
            {STATUS_LABELS[order.status]}
          </p>
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/20">
          <tr>
            <th className="py-2">Item</th>
            <th className="py-2">Qty</th>
            <th className="py-2">Unit price</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item) => (
            <tr key={item.id} className="border-b border-black/10">
              <td className="py-2">
                {item.product_name}
                {item.variant_label ? ` (${item.variant_label})` : ""}
              </td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2">{formatPrice(item.unit_price)}</td>
              <td className="py-2 text-right">{formatPrice(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-col items-end gap-1 border-t border-black/20 pt-4 text-sm">
        <div className="flex gap-4 text-zinc-500">
          <span>Shipping</span>
          <span className="w-32 text-right">{formatPrice(order.shipping_fee)}</span>
        </div>
        <div className="flex gap-4 text-lg font-bold">
          <span>Total (cash on delivery)</span>
          <span className="w-32 text-right">{formatPrice(order.total_amount)}</span>
        </div>
      </div>
    </div>
  );
}
