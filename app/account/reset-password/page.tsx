import type { Metadata } from "next";
import { AccountResetPasswordForm } from "@/components/account/reset-password-form";

export const metadata: Metadata = { title: "Set new password" };

export default function AccountResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-xl font-bold tracking-tight">Set new password</h1>
      <AccountResetPasswordForm />
    </div>
  );
}
