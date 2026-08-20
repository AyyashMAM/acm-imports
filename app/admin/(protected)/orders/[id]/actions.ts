"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/types";

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdminUser();

  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Invalid status");
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error("Could not update order status");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
