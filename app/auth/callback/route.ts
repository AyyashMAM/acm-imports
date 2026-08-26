import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Handles the link a customer clicks in their "confirm your email" message
// (Supabase's PKCE flow: ?code=...). Exchanges it for a session, then
// fills in profile fields captured at signup (see components/account/
// signup-form.tsx) now that we're allowed to write the row via RLS.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/account";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const meta = data.user.user_metadata as { full_name?: string; phone?: string };
      if (meta.full_name || meta.phone) {
        await supabase
          .from("profiles")
          .update({ full_name: meta.full_name, phone: meta.phone })
          .eq("id", data.user.id)
          .is("full_name", null);
      }
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
