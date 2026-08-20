import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { AdminProduct } from "./types";

const ADMIN_PRODUCT_SELECT =
  "id, name, description, category, base_price, is_active, created_at, product_images ( id, url, storage_path, sort_order ), product_variants ( id, label, sku, price, cost_price, stock_quantity, is_active )";

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
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as AdminProduct | null;
}
