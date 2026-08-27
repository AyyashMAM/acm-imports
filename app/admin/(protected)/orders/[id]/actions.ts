"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrderById } from "@/lib/admin/orders-data";
import {
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelled,
} from "@/lib/notifications";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/types";

function revalidateOrderPaths(orderId: string) {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/stock");
}

export async function confirmOrder(orderId: string) {
  await requireAdminUser();

  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status !== "pending") throw new Error("Order is no longer pending");

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "confirmed" })
    .eq("id", orderId)
    .eq("status", "pending");

  if (error) throw new Error("Could not confirm order");

  await notifyOrderConfirmed({ ...order, status: "confirmed" });
  revalidateOrderPaths(orderId);
}

export async function cancelOrder(orderId: string, formData: FormData) {
  await requireAdminUser();

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("A cancellation reason is required");

  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status === "cancelled") throw new Error("Order is already cancelled");

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled", cancellation_reason: reason })
    .eq("id", orderId)
    .neq("status", "cancelled");

  if (error) throw new Error("Could not cancel order");

  // Restore stock reserved by this order. Best-effort per item — a variant
  // that was since deleted (product_variant_id null) simply can't be restored.
  for (const item of order.order_items) {
    if (!item.product_variant_id) continue;
    await supabaseAdmin.rpc("decrement_variant_stock", {
      p_variant_id: item.product_variant_id,
      p_quantity: -item.quantity,
    });
  }

  await notifyOrderCancelled({ ...order, status: "cancelled", cancellation_reason: reason }, reason);
  revalidateOrderPaths(orderId);
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdminUser();

  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Invalid status");
  }

  const existing = await getOrderById(orderId);
  if (!existing) throw new Error("Order not found");
  const statusChanged = existing.status !== status;

  const courierName = String(formData.get("courier_name") ?? "").trim();
  const trackingNumber = String(formData.get("tracking_number") ?? "").trim();

  const update: Record<string, unknown> = { status };
  if (status === "shipped") {
    update.courier_name = courierName || null;
    update.tracking_number = trackingNumber || null;
  }

  const { error } = await supabaseAdmin.from("orders").update(update).eq("id", orderId);
  if (error) throw new Error("Could not update order status");

  // Only notify on an actual transition — resaving the same status (e.g.
  // correcting a tracking number after an order already shipped) shouldn't
  // re-send the customer a duplicate message.
  if (statusChanged) {
    const order = await getOrderById(orderId);
    if (order) {
      if (status === "shipped") await notifyOrderShipped(order);
      if (status === "delivered") await notifyOrderDelivered(order);
    }
  }

  revalidateOrderPaths(orderId);
}
