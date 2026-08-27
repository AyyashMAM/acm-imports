import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/track-order-form";

export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({
  searchParams,
}: PageProps<"/track-order">) {
  const { order } = await searchParams;
  const initialOrderNumber = Array.isArray(order) ? order[0] : order;

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight">Track your order</h1>
      <p className="mb-8 text-sm text-zinc-500">
        Enter your order number and the phone number you checked out with.
      </p>
      <TrackOrderForm initialOrderNumber={initialOrderNumber} />
    </div>
  );
}
