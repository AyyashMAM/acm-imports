import "server-only";
import { sendSms } from "@/lib/sms";
import {
  sendOrderPlacedEmail,
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "@/lib/email";
import type { Order } from "@/lib/admin/types";

// Every notification path funnels through here so email and SMS are always
// fired together, and so one channel (or the whole function) failing can
// never block the order/status-update it's attached to — every call is
// independently caught.
async function safe(label: string, task: Promise<void>) {
  try {
    await task;
  } catch (error) {
    console.error(`Notification failed (${label}):`, error);
  }
}

export async function notifyOrderPlaced(order: Order) {
  await Promise.all([
    safe("email:placed", sendOrderPlacedEmail(order)),
    safe(
      "sms:placed",
      sendSms(
        order.customer_phone,
        `Liora: We've received your order #${order.order_number}. Our team will confirm it shortly.`
      )
    ),
  ]);
}

export async function notifyOrderConfirmed(order: Order) {
  await Promise.all([
    safe("email:confirmed", sendOrderConfirmedEmail(order)),
    safe(
      "sms:confirmed",
      sendSms(
        order.customer_phone,
        `Liora: Your order #${order.order_number} is confirmed and being prepared.`
      )
    ),
  ]);
}

export async function notifyOrderShipped(order: Order) {
  const trackingLine = order.tracking_number
    ? ` Tracking: ${order.tracking_number} (${order.courier_name ?? "courier"}).`
    : "";

  await Promise.all([
    safe("email:shipped", sendOrderShippedEmail(order)),
    safe(
      "sms:shipped",
      sendSms(
        order.customer_phone,
        `Liora: Order #${order.order_number} has shipped.${trackingLine}`
      )
    ),
  ]);
}

export async function notifyOrderDelivered(order: Order) {
  await Promise.all([
    safe("email:delivered", sendOrderDeliveredEmail(order)),
    safe(
      "sms:delivered",
      sendSms(order.customer_phone, `Liora: Order #${order.order_number} has been delivered. Thank you!`)
    ),
  ]);
}

export async function notifyOrderCancelled(order: Order, reason: string) {
  await Promise.all([
    safe("email:cancelled", sendOrderCancelledEmail(order, reason)),
    safe(
      "sms:cancelled",
      sendSms(order.customer_phone, `Liora: Order #${order.order_number} was cancelled. Reason: ${reason}`)
    ),
  ]);
}
