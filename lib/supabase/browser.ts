"use client";

import { createBrowserClient } from "@supabase/ssr";

// Cookie-aware browser client, shared by the admin and customer auth forms,
// so signInWithPassword/signUp write the session into cookies (not
// localStorage), which the server clients above can then read on the next
// navigation.
export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
