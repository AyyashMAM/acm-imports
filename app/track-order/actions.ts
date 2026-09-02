"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { toNotifyLkFormat } from "@/lib/phone";
import type { Order } from "@/lib/admin/types";

const ORDER_SELECT =
  "id, order_number, status, payment_method, user_id, customer_name, customer_phone, customer_email, delivery_address, city, notes, cancellation_reason, courier_name, tracking_number, shipping_fee, total_amount, created_at, order_items ( id, product_variant_id, product_name, variant_label, unit_price, unit_cost, quantity, subtotal )";

export type TrackOrderState = { error: string } | { order: Order } | null;

// Public, no login required — a matching phone number is the only gate.
// Deliberately returns the same "not found" message whether the order
// number doesn't exist or the phone doesn't match, so this can't be used to
// probe for valid order numbers.
export async function trackOrder(
  _prevState: TrackOrderState,
  formData: FormData
): Promise<TrackOrderState> {
  const orderNumber = String(formData.get("order_number") ?? "").trim().toUpperCase();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!orderNumber || !phone) {
    return { error: "Enter both your order number and phone number." };
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_number", orderNumber)
    .maybeSingle();

  const notFound = { error: "We couldn't find an order matching those details." };

  if (error || !data) return notFound;
  if (toNotifyLkFormat(data.customer_phone) !== toNotifyLkFormat(phone)) return notFound;

  return { order: data as unknown as Order };
}
