import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/uuid";
import type { AdminCustomer } from "./types";

export type CustomerAddress = {
  id: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  is_default: boolean;
};

export async function getCustomers(): Promise<AdminCustomer[]> {
  const [{ data: profiles, error: profilesError }, { data: orders, error: ordersError }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("orders").select("user_id, total_amount").not("user_id", "is", null),
    ]);

  if (profilesError) throw profilesError;
  if (ordersError) throw ordersError;

  const stats = new Map<string, { count: number; total: number }>();
  for (const order of orders ?? []) {
    if (!order.user_id) continue;
    const s = stats.get(order.user_id) ?? { count: 0, total: 0 };
    s.count += 1;
    s.total += order.total_amount;
    stats.set(order.user_id, s);
  }

  const { data: usersPage, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (usersError) throw usersError;
  const emailMap = new Map(usersPage.users.map((u) => [u.id, u.email ?? null]));

  return (profiles ?? []).map((p) => {
    const s = stats.get(p.id) ?? { count: 0, total: 0 };
    return {
      id: p.id,
      email: emailMap.get(p.id) ?? null,
      full_name: p.full_name,
      phone: p.phone,
      created_at: p.created_at,
      order_count: s.count,
      total_spent: s.total,
    };
  });
}

export async function getCustomerById(id: string): Promise<AdminCustomer | null> {
  if (!isUuid(id)) return null;

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone, created_at, role")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!profile || profile.role !== "customer") return null;

  const [{ data: orders }, { data: user }] = await Promise.all([
    supabaseAdmin.from("orders").select("total_amount").eq("user_id", id),
    supabaseAdmin.auth.admin.getUserById(id),
  ]);

  const total = (orders ?? []).reduce((sum, o) => sum + o.total_amount, 0);

  return {
    id: profile.id,
    email: user?.user?.email ?? null,
    full_name: profile.full_name,
    phone: profile.phone,
    created_at: profile.created_at,
    order_count: (orders ?? []).length,
    total_spent: total,
  };
}

export async function getCustomerAddresses(userId: string): Promise<CustomerAddress[]> {
  if (!isUuid(userId)) return [];

  const { data, error } = await supabaseAdmin
    .from("addresses")
    .select("id, label, recipient_name, phone, address_line, city, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
