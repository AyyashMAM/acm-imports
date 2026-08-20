import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Server-only: an anon-key client bound to the current request's cookies, so
// auth.getUser() resolves the caller's session. RLS-bound (not a service-role
// bypass) — use this to read who's signed in, not to write catalog data.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render, where cookies() is
            // read-only. The proxy's session refresh keeps cookies fresh
            // for this case, so it's safe to ignore here.
          }
        },
      },
    }
  );
}
