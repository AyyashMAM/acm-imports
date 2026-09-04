import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { isUuid } from "@/lib/uuid";
import type { Product } from "@/lib/types";

const PRODUCT_SELECT =
  "id, name, description, category, attributes, base_price, weight_kg, brand, sku, benefits, how_to_use, ingredients, product_images ( id, url, sort_order ), product_variants ( id, label, price, stock_quantity )";

// Cached for 5 minutes and invalidated immediately by updateTag("products")
// whenever an admin edits a product, adjusts stock, or an order depletes it —
// see app/admin/(protected)/products*/actions.ts, app/admin/(protected)/stock/actions.ts
// and app/checkout/actions.ts.
export const getActiveProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
  ["active-products"],
  { tags: ["products"], revalidate: 300 }
);

export async function getProductById(id: string): Promise<Product | null> {
  if (!isUuid(id)) return null;
  return getCachedProductById(id);
}

const getCachedProductById = unstable_cache(
  async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Product | null;
  },
  ["product-by-id"],
  { tags: ["products"], revalidate: 300 }
);

export const getRelatedProducts = unstable_cache(
  async (category: string | null, excludeId: string, limit = 4): Promise<Product[]> => {
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
  },
  ["related-products"],
  { tags: ["products"], revalidate: 300 }
);
