import type { Metadata } from "next";
import Link from "next/link";
import { AccountForgotPasswordForm } from "@/components/account/forgot-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function AccountForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-xl font-bold tracking-tight">Reset password</h1>
      <p className="mb-6 text-sm text-zinc-500">
        We&apos;ll email you a link to set a new one.
      </p>
      <AccountForgotPasswordForm />
      <Link
        href="/account/login"
        className="mt-6 text-center text-sm font-semibold text-zinc-500 hover:text-zinc-800"
      >
        ← Back to login
      </Link>
    </div>
  );
}
