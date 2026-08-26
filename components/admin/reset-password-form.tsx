"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function AdminResetPasswordForm() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setPending(true);
    setError(null);

    const { error } = await supabaseBrowser.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  if (checking) return null;

  if (!hasSession) {
    return (
      <div className="text-sm text-zinc-600">
        <p className="mb-2 font-semibold text-zinc-900">Link invalid or expired</p>
        <p>
          Password reset links only work once and expire after a while. Request a new
          one from the login page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}
