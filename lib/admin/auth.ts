import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getAdminUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
