import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/currency";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, customer_name, delivery_address, city, shipping_fee, total_amount, created_at, order_items ( product_name, variant_label, quantity, unit_price, subtotal )"
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <ClearCartOnMount />
      <h1 className="mb-2 font-display text-2xl font-semibold tracking-tight text-zinc-900">
        Thank you, {order.customer_name}!
      </h1>
      <p className="mb-1 text-sm font-semibold text-zinc-500">
        Order #{order.order_number}
      </p>
      <p className="mb-8 text-zinc-600">
        We&apos;ve received your order — our team will confirm it shortly
        before dispatching to {order.delivery_address}, {order.city}. Pay in
        cash when it arrives.
      </p>

      <ul className="mb-6 flex flex-col gap-3 text-left text-sm">
        {order.order_items.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>
              {item.product_name} ({item.variant_label}) x{item.quantity}
            </span>
            <span className="font-mono">{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mb-10 flex flex-col gap-2 border-t border-black/10 pt-4 text-left text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Shipping</span>
          <span className="font-mono">{formatPrice(order.shipping_fee)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total (cash on delivery)</span>
          <span className="font-mono">{formatPrice(order.total_amount)}</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={`/track-order?order=${order.order_number}`}
          className="inline-block rounded-full border border-black/15 px-6 py-3 text-sm font-semibold hover:bg-black/[.04]"
        >
          Track this order
        </Link>
        <Link
          href="/products"
          className="inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-[#383838]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
