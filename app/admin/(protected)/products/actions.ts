"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isProductCategory, parseAttributesFromFormData } from "@/lib/category-fields";
import { isUploadableImage, uploadProductImage } from "@/lib/admin/product-images";
import { isProductStatus } from "@/lib/admin/types";

export async function createProduct(formData: FormData) {
  await requireAdminUser();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const basePrice = Number(formData.get("base_price"));
  const sku = String(formData.get("sku") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "draft");
  const status = isProductStatus(statusRaw) ? statusRaw : "draft";
  const isOnSale = formData.get("is_on_sale") === "on";
  const salePriceRaw = formData.get("sale_price");
  const salePrice = salePriceRaw ? Number(salePriceRaw) : null;
  const crueltyFree = formData.get("cruelty_free") === "on";
  const vegan = formData.get("vegan") === "on";

  if (!name || !isProductCategory(category) || Number.isNaN(basePrice) || basePrice < 0) {
    throw new Error("Invalid product details");
  }
  if (isOnSale && (salePrice === null || Number.isNaN(salePrice) || salePrice < 0)) {
    throw new Error("A valid sale price is required when the discount is active");
  }

  const attributes = parseAttributesFromFormData(category, formData);

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .insert({
      name,
      description: description || null,
      category,
      attributes,
      base_price: basePrice,
      sku: sku || null,
      status,
      is_active: status === "published",
      is_on_sale: isOnSale,
      sale_price: isOnSale ? salePrice : null,
      cruelty_free: crueltyFree,
      vegan,
    })
    .select("id")
    .single();

  if (error?.code === "23505") throw new Error("That SKU is already used by another product");
  if (error || !product) throw new Error("Could not create product");

  await supabaseAdmin.from("product_variants").insert({
    product_id: product.id,
    label: "Default",
    price: basePrice,
    stock_quantity: 0,
  });

  const images = formData.getAll("images").filter(isUploadableImage);
  await Promise.all(images.map((file, index) => uploadProductImage(product.id, file, index)));

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function deleteProduct(productId: string) {
  await requireAdminUser();

  const { data: images } = await supabaseAdmin
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  const paths = (images ?? [])
    .map((img) => img.storage_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await supabaseAdmin.storage.from("product-images").remove(paths);
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", productId);
  if (error) throw new Error("Could not delete product");

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
