"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isProductCategory, parseAttributesFromFormData } from "@/lib/category-fields";

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminUser();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const basePrice = Number(formData.get("base_price"));
  const isActive = formData.get("is_active") === "on";

  if (!name || !isProductCategory(category) || Number.isNaN(basePrice) || basePrice < 0) {
    throw new Error("Invalid product details");
  }

  const attributes = parseAttributesFromFormData(category, formData);

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      name,
      description: description || null,
      category,
      attributes,
      base_price: basePrice,
      is_active: isActive,
    })
    .eq("id", productId);

  if (error) throw new Error("Could not update product");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
}

export async function createVariant(productId: string, formData: FormData) {
  await requireAdminUser();

  const label = String(formData.get("label") ?? "").trim();
  const price = Number(formData.get("price"));
  const costPriceRaw = formData.get("cost_price");
  const costPrice = costPriceRaw ? Number(costPriceRaw) : null;
  const stockQuantity = Number(formData.get("stock_quantity"));
  const thresholdRaw = formData.get("low_stock_threshold");
  const lowStockThreshold = thresholdRaw ? Number(thresholdRaw) : null;

  if (!label || Number.isNaN(price) || price < 0 || Number.isNaN(stockQuantity)) {
    throw new Error("Invalid variant details");
  }

  const { error } = await supabaseAdmin.from("product_variants").insert({
    product_id: productId,
    label,
    price,
    cost_price: costPrice,
    stock_quantity: stockQuantity,
    low_stock_threshold: lowStockThreshold,
  });

  if (error) throw new Error("Could not create variant");
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateVariant(variantId: string, formData: FormData) {
  await requireAdminUser();

  const productId = String(formData.get("product_id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const price = Number(formData.get("price"));
  const costPriceRaw = formData.get("cost_price");
  const costPrice = costPriceRaw ? Number(costPriceRaw) : null;
  const stockQuantity = Number(formData.get("stock_quantity"));
  const isActive = formData.get("is_active") === "on";
  const thresholdRaw = formData.get("low_stock_threshold");
  const lowStockThreshold = thresholdRaw ? Number(thresholdRaw) : null;

  if (!label || Number.isNaN(price) || price < 0 || Number.isNaN(stockQuantity)) {
    throw new Error("Invalid variant details");
  }

  const { error } = await supabaseAdmin
    .from("product_variants")
    .update({
      label,
      price,
      cost_price: costPrice,
      stock_quantity: stockQuantity,
      is_active: isActive,
      low_stock_threshold: lowStockThreshold,
    })
    .eq("id", variantId);

  if (error) throw new Error("Could not update variant");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(variantId: string, productId: string) {
  await requireAdminUser();

  const { error } = await supabaseAdmin
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) throw new Error("Could not delete variant");
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImage(imageId: string, productId: string) {
  await requireAdminUser();

  const { data: image } = await supabaseAdmin
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId)
    .maybeSingle();

  if (image?.storage_path) {
    await supabaseAdmin.storage.from("product-images").remove([image.storage_path]);
  }

  const { error } = await supabaseAdmin
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) throw new Error("Could not delete image");
  revalidatePath(`/admin/products/${productId}`);
}

export async function reorderProductImages(
  productId: string,
  orderedImageIds: string[]
) {
  await requireAdminUser();

  await Promise.all(
    orderedImageIds.map((imageId, index) =>
      supabaseAdmin
        .from("product_images")
        .update({ sort_order: index })
        .eq("id", imageId)
    )
  );

  revalidatePath(`/admin/products/${productId}`);
}
