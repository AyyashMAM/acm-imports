import type { Metadata } from "next";
import Link from "next/link";
import { getMyProfile } from "@/lib/account/profile-data";
import { getMyAddresses } from "@/lib/account/addresses-data";
import { getMyOrders } from "@/lib/account/orders-data";
import { formatPrice } from "@/lib/currency";
import type { OrderStatus } from "@/lib/admin/types";
import { updateProfile, createAddress, deleteAddress, setDefaultAddress } from "../actions";

export const metadata: Metadata = { title: "My account" };

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-zinc-200 text-zinc-600",
};

export default async function AccountPage() {
  const [profile, addresses, orders] = await Promise.all([
    getMyProfile(),
    getMyAddresses(),
    getMyOrders(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold tracking-tight">My account</h1>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Profile</h2>
          <form action={updateProfile} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Full name</label>
              <input
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                value={profile?.email ?? ""}
                disabled
                className="w-full rounded-md border border-black/10 bg-zinc-100 px-3 py-2 text-sm text-zinc-500"
              />
            </div>
            <button
              type="submit"
              className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark"
            >
              Save changes
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Saved addresses</h2>
          <div className="flex flex-col gap-4">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-lg border border-black/10 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {a.recipient_name}
                      {a.is_default && (
                        <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-zinc-500">
                      {a.address_line}, {a.city}
                    </p>
                    <p className="text-zinc-500">{a.phone}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-3 text-xs font-semibold">
                  {!a.is_default && (
                    <form action={setDefaultAddress.bind(null, a.id)}>
                      <button type="submit" className="text-brand hover:underline">
                        Set as default
                      </button>
                    </form>
                  )}
                  <form action={deleteAddress.bind(null, a.id)}>
                    <button type="submit" className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {addresses.length === 0 && (
              <p className="text-sm text-zinc-500">No saved addresses yet.</p>
            )}

            <details className="rounded-lg border border-dashed border-black/20 p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                + Add a new address
              </summary>
              <form action={createAddress} className="mt-3 flex flex-col gap-3">
                <input
                  name="label"
                  placeholder="Label (e.g. Home, Work)"
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
                />
                <input
                  name="recipient_name"
                  placeholder="Recipient name"
                  required
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  required
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
                />
                <input
                  name="address_line"
                  placeholder="Address"
                  required
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
                />
                <input
                  name="city"
                  placeholder="City"
                  required
                  className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name="is_default" />
                  Set as default
                </label>
                <button
                  type="submit"
                  className="w-fit rounded-full border border-black/15 px-4 py-2 text-sm font-bold hover:bg-black/[.04]"
                >
                  Save address
                </button>
              </form>
            </details>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Order history</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No orders yet.{" "}
            <Link href="/products" className="font-semibold text-brand hover:underline">
              Start shopping →
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
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
                        href={`/account/orders/${order.id}`}
                        prefetch={false}
                        className="font-semibold hover:text-brand"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-2">{formatPrice(order.total_amount)}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
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
