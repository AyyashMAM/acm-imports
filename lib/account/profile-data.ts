import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
};

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return { id: data.id, email: user.email ?? null, full_name: data.full_name, phone: data.phone };
}
