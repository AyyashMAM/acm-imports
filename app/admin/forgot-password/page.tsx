import type { Metadata } from "next";
import Link from "next/link";
import { AdminForgotPasswordForm } from "@/components/admin/forgot-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold tracking-tight">Reset password</h1>
        <p className="mb-6 text-sm text-zinc-500">Liora Admin</p>
        <AdminForgotPasswordForm />
        <Link
          href="/admin/login"
          className="mt-6 block text-center text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
