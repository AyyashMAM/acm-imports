"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isProductCategory, parseAttributesFromFormData } from "@/lib/category-fields";
import { isProductStatus } from "@/lib/admin/types";
import { toKg } from "@/lib/weight";

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminUser();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const basePrice = Number(formData.get("base_price"));
  const weightKgPart = Number(formData.get("weight_kg_part") || 0);
  const weightGPart = Number(formData.get("weight_g_part") || 0);
  const weightKg = toKg(weightKgPart, weightGPart);
  const brand = String(formData.get("brand") ?? "").trim();
  const benefits = String(formData.get("benefits") ?? "").trim();
  const howToUse = String(formData.get("how_to_use") ?? "").trim();
  const ingredients = String(formData.get("ingredients") ?? "").trim();
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
  if (Number.isNaN(weightKg) || weightKg <= 0) {
    throw new Error("Weight is required and must be greater than 0");
  }
  if (isOnSale && (salePrice === null || Number.isNaN(salePrice) || salePrice < 0)) {
    throw new Error("A valid sale price is required when the discount is active");
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
      weight_kg: weightKg,
      sku: sku || null,
      status,
      is_active: status === "published",
      is_on_sale: isOnSale,
      sale_price: isOnSale ? salePrice : null,
      cruelty_free: crueltyFree,
      vegan,
      brand: brand || null,
      benefits: benefits || null,
      how_to_use: howToUse || null,
      ingredients: ingredients || null,
    })
    .eq("id", productId);

  if (error?.code === "23505") throw new Error("That SKU is already used by another product");
  if (error) throw new Error("Could not update product");
  revalidatePath(`/admin/products/${productId}`);
  updateTag(`product-${productId}`);
  updateTag("products");
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
  const sku = String(formData.get("sku") ?? "").trim();
  const barcode = String(formData.get("barcode") ?? "").trim();
  const expiryDate = String(formData.get("expiry_date") ?? "").trim();

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
    sku: sku || null,
    barcode: barcode || null,
    expiry_date: expiryDate || null,
  });

  if (error) throw new Error("Could not create variant");
  revalidatePath(`/admin/products/${productId}`);
  updateTag(`product-${productId}`);
  updateTag("products");
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
  const sku = String(formData.get("sku") ?? "").trim();
  const barcode = String(formData.get("barcode") ?? "").trim();
  const expiryDate = String(formData.get("expiry_date") ?? "").trim();

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
      sku: sku || null,
      barcode: barcode || null,
      expiry_date: expiryDate || null,
    })
    .eq("id", variantId);

  if (error) throw new Error("Could not update variant");
  revalidatePath(`/admin/products/${productId}`);
  updateTag(`product-${productId}`);
  updateTag("products");
}

export async function deleteVariant(variantId: string, productId: string) {
  await requireAdminUser();

  const { error } = await supabaseAdmin
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) throw new Error("Could not delete variant");
  revalidatePath(`/admin/products/${productId}`);
  updateTag(`product-${productId}`);
  updateTag("products");
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
  updateTag(`product-${productId}`);
  updateTag("products");
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
  updateTag(`product-${productId}`);
  updateTag("products");
}
