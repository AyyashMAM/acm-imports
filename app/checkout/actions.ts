"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notifyOrderPlaced } from "@/lib/notifications";
import { calculateShippingFee } from "@/lib/shipping";
import type { Order } from "@/lib/admin/types";

type CheckoutCartItem = {
  variantId: string;
  quantity: number;
};

export type CheckoutState = { error: string } | null;

export async function placeOrder(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const cartRaw = String(formData.get("cart") ?? "[]");

  if (!customerName || !customerPhone || !deliveryAddress || !city) {
    return { error: "Please fill in all required fields." };
  }

  let cart: CheckoutCartItem[];
  try {
    cart = JSON.parse(cartRaw);
  } catch {
    return { error: "Your cart looks invalid. Please try again." };
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return { error: "Your cart is empty." };
  }

  // Signed-in customers get their order linked to their account; guests
  // check out exactly as before (user stays null).
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const variantIds = cart.map((i) => i.variantId);
  const { data: variants, error: variantsError } = await supabaseAdmin
    .from("product_variants")
    .select("id, label, price, cost_price, stock_quantity, product_id, products ( name, weight_kg )")
    .in("id", variantIds);

  if (variantsError) {
    return { error: "Could not verify your order. Please try again." };
  }

  const variantMap = new Map((variants ?? []).map((v) => [v.id, v]));

  let itemsSubtotal = 0;
  let totalWeightKg = 0;
  const orderItems: {
    product_variant_id: string;
    product_name: string;
    variant_label: string;
    unit_price: number;
    unit_cost: number | null;
    quantity: number;
    subtotal: number;
  }[] = [];

  for (const cartItem of cart) {
    const variant = variantMap.get(cartItem.variantId);
    if (!variant) {
      return { error: "One of the items in your cart is no longer available." };
    }
    if (cartItem.quantity < 1 || cartItem.quantity > variant.stock_quantity) {
      return {
        error: `Only ${variant.stock_quantity} left of "${variant.label}". Please adjust your cart.`,
      };
    }
    const subtotal = variant.price * cartItem.quantity;
    itemsSubtotal += subtotal;
    // @ts-expect-error -- joined relation typed loosely by supabase-js
    totalWeightKg += (variant.products?.weight_kg ?? 0) * cartItem.quantity;
    orderItems.push({
      product_variant_id: variant.id,
      // @ts-expect-error -- joined relation typed loosely by supabase-js
      product_name: variant.products?.name ?? "",
      variant_label: variant.label,
      unit_price: variant.price,
      unit_cost: variant.cost_price,
      quantity: cartItem.quantity,
      subtotal,
    });
  }

  // Server-computed from the combined weight of the order — never trust a
  // client-sent shipping amount, since that would let checkout be tampered
  // with to undercharge delivery.
  const shippingFee = calculateShippingFee(totalWeightKg);
  const total = itemsSubtotal + shippingFee;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      delivery_address: deliveryAddress,
      city,
      notes: notes || null,
      payment_method: "cod",
      shipping_fee: shippingFee,
      total_amount: total,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { error: "Could not place your order. Please try again." };
  }

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    return { error: "Could not place your order. Please try again." };
  }

  // Atomic, race-safe decrement (supabase/migrations/20260826000002_stock_management.sql):
  // only succeeds if enough stock is still available, so two customers racing
  // for the last unit can't both win. If a race causes one to lose here (rare —
  // the check above already passed a moment earlier), cancel the order rather
  // than silently overselling.
  let oversold = false;
  for (const item of orderItems) {
    const { data: ok, error: decrementError } = await supabaseAdmin.rpc(
      "decrement_variant_stock",
      { p_variant_id: item.product_variant_id, p_quantity: item.quantity }
    );
    if (decrementError || !ok) {
      oversold = true;
      break;
    }
  }

  if (oversold) {
    await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return {
      error:
        "Sorry, one of these items just sold out while you were checking out. Your order was not placed — please review your cart.",
    };
  }

  updateTag("products");

  const fullOrder: Order = {
    id: order.id,
    order_number: order.order_number,
    status: "pending",
    payment_method: "cod",
    user_id: user?.id ?? null,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || null,
    delivery_address: deliveryAddress,
    city,
    notes: notes || null,
    cancellation_reason: null,
    courier_name: null,
    tracking_number: null,
    shipping_fee: shippingFee,
    total_amount: total,
    created_at: new Date().toISOString(),
    order_items: orderItems.map((item, i) => ({ id: String(i), ...item })),
  };
  await notifyOrderPlaced(fullOrder);

  redirect(`/order-confirmation/${order.id}`);
}
