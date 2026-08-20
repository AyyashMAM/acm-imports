// Creates the single admin account out-of-band (no public self-signup route exists).
// Run with: node --env-file=.env.local scripts/create-admin.mjs <email> <password>
import { createClient } from "@supabase/supabase-js";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
}

console.log(`Admin account created: ${data.user.email} (${data.user.id})`);
