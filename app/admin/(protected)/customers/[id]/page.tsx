import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerById, getCustomerAddresses } from "@/lib/admin/customers-data";
import { getOrdersByUserId } from "@/lib/admin/orders-data";
import { formatPrice } from "@/lib/currency";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/order-status";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminCustomerDetailPage({
  params,
}: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const [orders, addresses] = await Promise.all([
    getOrdersByUserId(id),
    getCustomerAddresses(id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">
        {customer.full_name || "Unnamed customer"}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">Profile</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <Row label="Email" value={customer.email ?? "—"} />
            <Row label="Phone" value={customer.phone ?? "—"} />
            <Row label="Orders" value={String(customer.order_count)} />
            <Row label="Total spent" value={formatPrice(customer.total_spent)} />
            <Row label="Joined" value={new Date(customer.created_at).toLocaleDateString()} />
          </dl>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">Saved addresses</h2>
          {addresses.length === 0 ? (
            <p className="text-sm text-zinc-500">No saved addresses.</p>
          ) : (
            <ul className="flex flex-col gap-3 text-sm">
              {addresses.map((a) => (
                <li key={a.id} className="border-t border-black/5 pt-3 first:border-0 first:pt-0">
                  <p className="font-semibold">
                    {a.recipient_name} {a.is_default && <span className="ml-1 rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">Default</span>}
                  </p>
                  <p className="text-zinc-500">{a.address_line}, {a.city}</p>
                  <p className="text-zinc-500">{a.phone}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Order history</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-black/10 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="py-2">Order</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-black/5 last:border-0">
                    <td className="py-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        prefetch={false}
                        className="font-semibold hover:text-brand"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-2">{formatPrice(order.total_amount)}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-2 text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
