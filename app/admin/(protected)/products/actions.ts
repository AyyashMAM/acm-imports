"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createProduct(formData: FormData) {
  await requireAdminUser();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const basePrice = Number(formData.get("base_price"));

  if (!name || Number.isNaN(basePrice) || basePrice < 0) {
    throw new Error("Invalid product details");
  }

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .insert({
      name,
      description: description || null,
      category: category || null,
      base_price: basePrice,
    })
    .select("id")
    .single();

  if (error || !product) throw new Error("Could not create product");

  await supabaseAdmin.from("product_variants").insert({
    product_id: product.id,
    label: "Default",
    price: basePrice,
    stock_quantity: 0,
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}
