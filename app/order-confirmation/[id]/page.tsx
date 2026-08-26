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
      "id, customer_name, delivery_address, city, total_amount, created_at, order_items ( product_name, variant_label, quantity, unit_price, subtotal )"
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <ClearCartOnMount />
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">
        Thank you, {order.customer_name}!
      </h1>
      <p className="mb-8 text-zinc-600">
        Your order has been placed. We&apos;ll contact you to confirm delivery
        to {order.delivery_address}, {order.city}. Pay in cash when it
        arrives.
      </p>

      <ul className="mb-6 flex flex-col gap-3 text-left text-sm">
        {order.order_items.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>
              {item.product_name} ({item.variant_label}) x{item.quantity}
            </span>
            <span>{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mb-10 flex justify-between border-t border-black/10 pt-4 font-semibold">
        <span>Total (cash on delivery)</span>
        <span>{formatPrice(order.total_amount)}</span>
      </div>

      <Link
        href="/products"
        className="inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-[#383838]"
      >
        Continue shopping
      </Link>
    </div>
  );
}
