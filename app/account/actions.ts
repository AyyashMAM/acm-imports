"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAccountUser } from "@/lib/account/auth";

export async function signOutAccount() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const user = await requireAccountUser();
  const supabase = await createServerSupabaseClient();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null, phone: phone || null })
    .eq("id", user.id);

  if (error) throw new Error("Could not update profile");
  revalidatePath("/account");
}

export async function createAddress(formData: FormData) {
  const user = await requireAccountUser();
  const supabase = await createServerSupabaseClient();

  const label = String(formData.get("label") ?? "").trim();
  const recipientName = String(formData.get("recipient_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const addressLine = String(formData.get("address_line") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const isDefault = formData.get("is_default") === "on";

  if (!recipientName || !phone || !addressLine || !city) {
    throw new Error("Please fill in all required fields");
  }

  if (isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: label || null,
    recipient_name: recipientName,
    phone,
    address_line: addressLine,
    city,
    is_default: isDefault,
  });

  if (error) throw new Error("Could not save address");
  revalidatePath("/account");
}

export async function deleteAddress(addressId: string) {
  const user = await requireAccountUser();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw new Error("Could not delete address");
  revalidatePath("/account");
}

export async function setDefaultAddress(addressId: string) {
  const user = await requireAccountUser();
  const supabase = await createServerSupabaseClient();

  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw new Error("Could not set default address");
  revalidatePath("/account");
}

export async function toggleWishlist(productId: string): Promise<{ saved: boolean }> {
  const user = await requireAccountUser();
  const supabase = await createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
    revalidatePath("/account/wishlist");
    return { saved: false };
  }

  await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
  revalidatePath("/account/wishlist");
  return { saved: true };
}

export async function isProductWishlisted(productId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  return !!data;
}
