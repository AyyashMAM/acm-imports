import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only: bypasses RLS via the service role key. Never import this file
// from a client component, and never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
