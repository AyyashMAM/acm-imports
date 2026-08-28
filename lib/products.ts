import { supabase } from "@/lib/supabase/client";
import { isUuid } from "@/lib/uuid";
import type { Product } from "@/lib/types";

const PRODUCT_SELECT =
  "id, name, description, category, attributes, base_price, brand, benefits, how_to_use, ingredients, product_images ( id, url, sort_order ), product_variants ( id, label, price, stock_quantity )";

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Product | null;
}

export async function getRelatedProducts(
  category: string | null,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  if (!category) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category", category)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}
