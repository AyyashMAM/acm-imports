import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/currency";
import { SITE_URL } from "@/lib/seo";
import type { Order } from "@/lib/admin/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "orders@liora.lk";

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #171717;">
      <div style="background: #ff5a1f; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <span style="color: #fff; font-size: 18px; font-weight: 800;">Liora</span>
      </div>
      <div style="border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
        <h1 style="font-size: 18px; margin: 0 0 12px;">${title}</h1>
        ${bodyHtml}
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 16px; text-align: center;">
        Liora &middot; Cash on delivery available nationwide
      </p>
    </div>
  `;
}

function itemsTable(order: Order): string {
  const rows = order.order_items
    .map(
      (item) => `
        <tr>
          <td style="padding: 6px 0;">${item.product_name}${item.variant_label ? ` (${item.variant_label})` : ""} x${item.quantity}</td>
          <td style="padding: 6px 0; text-align: right;">${formatPrice(item.subtotal)}</td>
        </tr>`
    )
    .join("");

  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 12px 0;">
      ${rows}
      <tr style="border-top: 1px solid #eee; font-weight: 700;">
        <td style="padding: 10px 0 0;">Total (cash on delivery)</td>
        <td style="padding: 10px 0 0; text-align: right;">${formatPrice(order.total_amount)}</td>
      </tr>
    </table>
  `;
}

function trackingUrl(order: Order): string {
  return new URL(`/track-order?order=${order.order_number}`, SITE_URL).toString();
}

export async function sendOrderPlacedEmail(order: Order) {
  if (!resend || !order.customer_email) return;

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `We've received your order — #${order.order_number}`,
    html: layout(
      `Thanks, ${order.customer_name}!`,
      `<p style="font-size: 14px; line-height: 1.5;">We've received your order <strong>#${order.order_number}</strong>. Our team will confirm it shortly before dispatching to ${order.delivery_address}, ${order.city}. Pay in cash when it arrives.</p>${itemsTable(order)}`
    ),
  });
}

export async function sendOrderConfirmedEmail(order: Order) {
  if (!resend || !order.customer_email) return;

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Order confirmed — #${order.order_number}`,
    html: layout(
      "Your order is confirmed",
      `<p style="font-size: 14px; line-height: 1.5;">Good news — order <strong>#${order.order_number}</strong> is confirmed and being prepared for delivery.</p>${itemsTable(order)}`
    ),
  });
}

export async function sendOrderShippedEmail(order: Order) {
  if (!resend || !order.customer_email) return;

  const trackingLine = order.tracking_number
    ? `<p style="font-size: 14px; line-height: 1.5;">Courier: <strong>${order.courier_name ?? "—"}</strong><br />Tracking number: <strong>${order.tracking_number}</strong></p>`
    : "";

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your order is on its way — #${order.order_number}`,
    html: layout(
      "Your order has shipped",
      `<p style="font-size: 14px; line-height: 1.5;">Order <strong>#${order.order_number}</strong> is on its way to ${order.delivery_address}, ${order.city}. Have cash ready for delivery.</p>${trackingLine}<p style="font-size: 14px;"><a href="${trackingUrl(order)}" style="color: #ff5a1f;">Track your order →</a></p>${itemsTable(order)}`
    ),
  });
}

export async function sendOrderDeliveredEmail(order: Order) {
  if (!resend || !order.customer_email) return;

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Delivered — #${order.order_number}`,
    html: layout(
      "Delivered! Thank you for shopping with us",
      `<p style="font-size: 14px; line-height: 1.5;">Order <strong>#${order.order_number}</strong> has been delivered. We hope you love it — thanks for shopping with Liora!</p>${itemsTable(order)}`
    ),
  });
}

export async function sendOrderCancelledEmail(order: Order, reason: string) {
  if (!resend || !order.customer_email) return;

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Order cancelled — #${order.order_number}`,
    html: layout(
      "Your order was cancelled",
      `<p style="font-size: 14px; line-height: 1.5;">Order <strong>#${order.order_number}</strong> has been cancelled. Reason: ${reason}</p><p style="font-size: 14px; line-height: 1.5;">If this doesn't seem right, please get in touch and we'll sort it out.</p>`
    ),
  });
}
