import { createClient } from "@supabase/supabase-js";

// Safe to use in browser/client components: only grants access allowed by RLS policies
// (reading the product catalog, creating orders as a guest).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
