"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

  const variantIds = cart.map((i) => i.variantId);
  const { data: variants, error: variantsError } = await supabaseAdmin
    .from("product_variants")
    .select("id, label, price, cost_price, stock_quantity, product_id, products ( name )")
    .in("id", variantIds);

  if (variantsError) {
    return { error: "Could not verify your order. Please try again." };
  }

  const variantMap = new Map((variants ?? []).map((v) => [v.id, v]));

  let total = 0;
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
    total += subtotal;
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

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      delivery_address: deliveryAddress,
      city,
      notes: notes || null,
      payment_method: "cod",
      total_amount: total,
    })
    .select("id")
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

  for (const item of orderItems) {
    const variant = variantMap.get(item.product_variant_id)!;
    await supabaseAdmin
      .from("product_variants")
      .update({ stock_quantity: variant.stock_quantity - item.quantity })
      .eq("id", item.product_variant_id);
  }

  redirect(`/order-confirmation/${order.id}`);
}
