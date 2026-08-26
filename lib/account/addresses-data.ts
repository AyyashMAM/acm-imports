import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Address = {
  id: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  is_default: boolean;
};

export async function getMyAddresses(): Promise<Address[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("id, label, recipient_name, phone, address_line, city, is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
