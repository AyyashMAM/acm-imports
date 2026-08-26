import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AdminProductVariant } from "./types";

export type StockStatus = "in_stock" | "low" | "out";

export type StockRow = {
  product: { id: string; name: string };
  variant: AdminProductVariant;
  effectiveThreshold: number;
  status: StockStatus;
};

export type StockAdjustment = {
  id: string;
  delta: number;
  reason: string;
  created_at: string;
  variant_label: string;
  product_name: string;
};

export async function getDefaultLowStockThreshold(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from("store_settings")
    .select("low_stock_threshold")
    .eq("id", true)
    .single();

  if (error) throw error;
  return data.low_stock_threshold;
}

export async function setDefaultLowStockThreshold(threshold: number) {
  const { error } = await supabaseAdmin
    .from("store_settings")
    .update({ low_stock_threshold: threshold })
    .eq("id", true);

  if (error) throw new Error("Could not update low-stock threshold");
}

function statusFor(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity <= threshold) return "low";
  return "in_stock";
}

export async function getStockRows(): Promise<StockRow[]> {
  const [defaultThreshold, { data: products, error }] = await Promise.all([
    getDefaultLowStockThreshold(),
    supabaseAdmin
      .from("products")
      .select(
        "id, name, product_variants ( id, label, sku, price, cost_price, stock_quantity, low_stock_threshold, is_active )"
      )
      .order("name"),
  ]);

  if (error) throw error;

  const rows: StockRow[] = [];
  for (const product of products ?? []) {
    for (const variant of (product.product_variants ??
      []) as AdminProductVariant[]) {
      const effectiveThreshold = variant.low_stock_threshold ?? defaultThreshold;
      rows.push({
        product: { id: product.id, name: product.name },
        variant,
        effectiveThreshold,
        status: statusFor(variant.stock_quantity, effectiveThreshold),
      });
    }
  }
  return rows;
}

export async function adjustStock(
  variantId: string,
  delta: number,
  reason: string,
  adminUserId: string
) {
  const { data: variant, error: fetchError } = await supabaseAdmin
    .from("product_variants")
    .select("stock_quantity")
    .eq("id", variantId)
    .single();

  if (fetchError || !variant) throw new Error("Variant not found");

  const newQuantity = variant.stock_quantity + delta;
  if (newQuantity < 0) {
    throw new Error(
      `That would take stock below zero (currently ${variant.stock_quantity}).`
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("product_variants")
    .update({ stock_quantity: newQuantity })
    .eq("id", variantId);

  if (updateError) throw new Error("Could not adjust stock");

  const { error: logError } = await supabaseAdmin.from("stock_adjustments").insert({
    product_variant_id: variantId,
    delta,
    reason,
    created_by: adminUserId,
  });

  if (logError) throw new Error("Stock was updated but the adjustment log failed to save");
}

export async function getRecentAdjustments(limit = 50): Promise<StockAdjustment[]> {
  const { data, error } = await supabaseAdmin
    .from("stock_adjustments")
    .select(
      "id, delta, reason, created_at, product_variants ( label, products ( name ) )"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const variant = row.product_variants as unknown as
      | { label: string; products: { name: string } | null }
      | null;
    return {
      id: row.id,
      delta: row.delta,
      reason: row.reason,
      created_at: row.created_at,
      variant_label: variant?.label ?? "—",
      product_name: variant?.products?.name ?? "—",
    };
  });
}
