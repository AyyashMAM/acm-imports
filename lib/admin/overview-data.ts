import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { COLOMBO_OFFSET_MS, startOfColomboDay } from "./reports-data";
import { getStockRows, type StockRow } from "./stock-data";
import { getOrders } from "./orders-data";
import type { Order } from "./types";

export type OverviewStats = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  pendingQueue: Order[];
  dailySales: { date: string; revenue: number }[];
  lowStock: StockRow[];
  outOfStock: StockRow[];
};

function colomboDateKey(iso: string): string {
  const shifted = new Date(new Date(iso).getTime() + COLOMBO_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const [{ data: orders, error }, stockRows, pendingQueue] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("total_amount, created_at, status")
      .neq("status", "cancelled"),
    getStockRows(),
    getOrders("pending"),
  ]);

  if (error) throw error;

  const allOrders = orders ?? [];
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter((o) => o.status === "pending").length;

  const dailySales: { date: string; revenue: number }[] = [];
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const key = colomboDateKey(startOfColomboDay(i).toISOString());
    buckets.set(key, 0);
  }

  const windowStart = startOfColomboDay(29);
  for (const order of allOrders) {
    if (new Date(order.created_at) < windowStart) continue;
    const key = colomboDateKey(order.created_at);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + order.total_amount);
    }
  }
  for (const [date, revenue] of buckets) dailySales.push({ date, revenue });

  const lowStock = stockRows.filter((r) => r.status === "low");
  const outOfStock = stockRows.filter((r) => r.status === "out");

  return { totalRevenue, totalOrders, pendingOrders, pendingQueue, dailySales, lowStock, outOfStock };
}
