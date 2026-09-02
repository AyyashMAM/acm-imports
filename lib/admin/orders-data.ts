import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/uuid";
import type { Order, OrderStatus } from "./types";

const ORDER_SELECT =
  "id, order_number, status, payment_method, user_id, customer_name, customer_phone, customer_email, delivery_address, city, notes, cancellation_reason, courier_name, tracking_number, shipping_fee, total_amount, created_at, order_items ( id, product_variant_id, product_name, variant_label, unit_price, unit_cost, quantity, subtotal )";

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  let query = supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  if (!isUuid(userId)) return [];

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!isUuid(id)) return null;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Order | null;
}
