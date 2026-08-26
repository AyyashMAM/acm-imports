"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrderById } from "@/lib/admin/orders-data";
import { sendOrderShippedEmail } from "@/lib/email";
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

  if (status === "shipped") {
    const order = await getOrderById(orderId);
    if (order) {
      await sendOrderShippedEmail(order).catch(() => {
        // Best-effort: a failed email shouldn't block the status update.
      });
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
