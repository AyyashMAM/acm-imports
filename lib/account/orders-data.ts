import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import type { Order } from "@/lib/admin/types";

const ORDER_SELECT =
  "id, order_number, status, payment_method, user_id, customer_name, customer_phone, customer_email, delivery_address, city, notes, cancellation_reason, courier_name, tracking_number, shipping_fee, total_amount, created_at, order_items ( id, product_variant_id, product_name, variant_label, unit_price, unit_cost, quantity, subtotal )";

// RLS-scoped: the "Users can read own orders"/"...order items" policies
// (supabase/migrations/20260826000001_customer_accounts.sql) mean this
// naturally returns only the signed-in customer's own orders — no manual
// user_id filter needed, and none would help if forgotten anyway.
export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

export async function getMyOrderById(id: string): Promise<Order | null> {
  if (!isUuid(id)) return null;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Order | null;
}
