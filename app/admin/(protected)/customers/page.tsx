import type { Metadata } from "next";
import Link from "next/link";
import { getCustomers } from "@/lib/admin/customers-data";
import { formatPrice } from "@/lib/currency";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900">Customers</h1>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/10 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total spent</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-black/5 last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    prefetch={false}
                    className="font-semibold hover:text-brand"
                  >
                    {c.full_name || "Unnamed"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">{c.email ?? "—"}</td>
                <td className="px-4 py-3 font-mono">{c.order_count}</td>
                <td className="px-4 py-3 font-mono">{formatPrice(c.total_spent)}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">No registered customers yet.</p>
        )}
      </div>
    </div>
  );
}
