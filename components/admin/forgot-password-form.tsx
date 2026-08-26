"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    // Supabase doesn't reveal whether the email exists, so we always show
    // the same confirmation regardless of the result.
    await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?redirect=/admin/reset-password`,
    });

    setSent(true);
    setPending(false);
  };

  if (sent) {
    return (
      <div className="text-sm text-zinc-600">
        <p className="mb-2 font-semibold text-zinc-900">Check your email</p>
        <p>
          If <strong>{email}</strong> is an admin account, we&apos;ve sent a link to reset
          its password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
