import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Order } from "./types";

export type ReportRange = "today" | "7d" | "30d" | "all";

export const REPORT_RANGES: { value: ReportRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

// Sri Lanka is a fixed UTC+5:30 offset (no DST), so day boundaries can be
// computed without a timezone database: shift "now" by the offset to read
// Colombo-local wall-clock fields, then shift the resulting midnight back.
const COLOMBO_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

function startOfColomboDay(daysAgo: number): Date {
  const shiftedNow = new Date(Date.now() + COLOMBO_OFFSET_MS);
  const localMidnightShifted = Date.UTC(
    shiftedNow.getUTCFullYear(),
    shiftedNow.getUTCMonth(),
    shiftedNow.getUTCDate() - daysAgo,
    0,
    0,
    0
  );
  return new Date(localMidnightShifted - COLOMBO_OFFSET_MS);
}

function rangeStart(range: ReportRange): Date | null {
  switch (range) {
    case "today":
      return startOfColomboDay(0);
    case "7d":
      return startOfColomboDay(6);
    case "30d":
      return startOfColomboDay(29);
    case "all":
      return null;
  }
}

export type SalesReport = {
  revenue: number;
  cost: number;
  profit: number;
  orderCount: number;
  orders: Order[];
};

const ORDER_SELECT =
  "id, status, payment_method, customer_name, customer_phone, customer_email, delivery_address, city, notes, total_amount, created_at, order_items ( id, product_variant_id, product_name, variant_label, unit_price, unit_cost, quantity, subtotal )";

export async function getSalesReport(range: ReportRange): Promise<SalesReport> {
  const start = rangeStart(range);

  let query = supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (start) query = query.gte("created_at", start.toISOString());

  const { data, error } = await query;
  if (error) throw error;

  const orders = (data ?? []) as unknown as Order[];

  let revenue = 0;
  let cost = 0;
  for (const order of orders) {
    revenue += order.total_amount;
    for (const item of order.order_items) {
      // Missing cost (older order or unpriced variant) is treated as 0,
      // per the decision to keep this simple rather than flag it in v1.
      cost += (item.unit_cost ?? 0) * item.quantity;
    }
  }

  return {
    revenue,
    cost,
    profit: revenue - cost,
    orderCount: orders.length,
    orders,
  };
}
