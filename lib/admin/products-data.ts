import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/uuid";
import type { AdminProduct } from "./types";

const ADMIN_PRODUCT_SELECT =
  "id, name, description, category, attributes, base_price, weight_kg, brand, benefits, how_to_use, ingredients, is_active, sku, status, is_on_sale, sale_price, cruelty_free, vegan, created_at, product_images ( id, url, storage_path, sort_order ), product_variants ( id, label, sku, barcode, price, cost_price, stock_quantity, low_stock_threshold, expiry_date, is_active )";

export async function getAllProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdminProduct[];
}

export async function getAdminProductById(
  id: string
): Promise<AdminProduct | null> {
  if (!isUuid(id)) return null;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as AdminProduct | null;
}

// Feeds the brand <datalist> on the product form so admins can reuse an
// existing brand name (avoiding near-duplicate spellings) or type a new one.
export async function getDistinctBrands(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("brand")
    .not("brand", "is", null);

  if (error) throw error;

  const brands = new Set(
    (data ?? [])
      .map((row) => row.brand?.trim())
      .filter((b): b is string => Boolean(b))
  );
  return Array.from(brands).sort((a, b) => a.localeCompare(b));
}
