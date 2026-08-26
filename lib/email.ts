import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/currency";
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

export async function sendOrderConfirmationEmail(order: Order) {
  if (!resend || !order.customer_email) return;

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Order confirmed — #${order.id.slice(0, 8)}`,
    html: layout(
      `Thanks, ${order.customer_name}!`,
      `<p style="font-size: 14px; line-height: 1.5;">We've received your order and will contact you to confirm delivery to ${order.delivery_address}, ${order.city}. Pay in cash when it arrives.</p>${itemsTable(order)}`
    ),
  });
}

export async function sendOrderShippedEmail(order: Order) {
  if (!resend || !order.customer_email) return;

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your order is on its way — #${order.id.slice(0, 8)}`,
    html: layout(
      "Your order has shipped",
      `<p style="font-size: 14px; line-height: 1.5;">Order #${order.id.slice(0, 8)} is on its way to ${order.delivery_address}, ${order.city}. Have cash ready for delivery.</p>${itemsTable(order)}`
    ),
  });
}
