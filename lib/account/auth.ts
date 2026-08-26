import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Server Component / layout gate: navigates to login. proxy.ts already
// redirects unauthenticated /account/* requests, but every page/action
// checks independently too, matching the same defense-in-depth pattern
// used for /admin (see lib/admin/auth.ts).
export async function requireAccountUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  return user;
}
