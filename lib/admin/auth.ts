import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/roles";

async function getAdminUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole | undefined) ?? null;
  if (role !== "admin") return null;

  return user;
}

// Server Component / layout gate: navigates to the login page.
export async function requireAdminSession() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

// Server Action / Route Handler gate: throws/401s instead of navigating.
// proxy.ts covers most requests, but per Next's own guidance its matcher
// coverage can silently break under refactors — every admin mutation checks
// this independently rather than trusting proxy.ts alone.
export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
