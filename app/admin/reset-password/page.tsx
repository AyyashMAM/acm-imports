import type { Metadata } from "next";
import { AdminResetPasswordForm } from "@/components/admin/reset-password-form";

export const metadata: Metadata = { title: "Set new password" };

export default function AdminResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold tracking-tight">Set new password</h1>
        <p className="mb-6 text-sm text-zinc-500">Liora Admin</p>
        <AdminResetPasswordForm />
      </div>
    </div>
  );
}
