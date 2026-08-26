import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export async function getMyWishlistProductIds(): Promise<Set<string>> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);

  return new Set((data ?? []).map((r) => r.product_id));
}

const PRODUCT_SELECT =
  "id, name, description, category, attributes, base_price, product_images ( id, url, sort_order ), product_variants ( id, label, price, stock_quantity )";

export async function getMyWishlistProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlist_items")
    .select(`product_id, products ( ${PRODUCT_SELECT} )`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? [])
    .map((row) => row.products)
    .filter(Boolean) as unknown as Product[];
}
