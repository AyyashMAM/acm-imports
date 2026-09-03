"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { adjustStock, setDefaultLowStockThreshold } from "@/lib/admin/stock-data";

export type AdjustStockState = { error: string } | { success: true } | null;

export async function adjustStockAction(
  _prevState: AdjustStockState,
  formData: FormData
): Promise<AdjustStockState> {
  const admin = await requireAdminUser();

  const variantId = String(formData.get("variant_id") ?? "");
  const delta = Number(formData.get("delta"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (!variantId || Number.isNaN(delta) || delta === 0) {
    return { error: "Enter a non-zero amount to add or remove." };
  }
  if (!reason) {
    return { error: "A reason is required for stock adjustments." };
  }

  try {
    await adjustStock(variantId, delta, reason, admin.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not adjust stock." };
  }

  revalidatePath("/admin/stock");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  updateTag("products");
  return { success: true };
}

export async function updateDefaultThreshold(formData: FormData) {
  await requireAdminUser();

  const threshold = Number(formData.get("low_stock_threshold"));
  if (Number.isNaN(threshold) || threshold < 0) {
    throw new Error("Invalid threshold");
  }

  await setDefaultLowStockThreshold(threshold);
  revalidatePath("/admin/stock");
  revalidatePath("/admin");
}
