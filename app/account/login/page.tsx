import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountLoginForm } from "@/components/account/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function AccountLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-xl font-bold tracking-tight">Log in</h1>
      <p className="mb-6 text-sm text-zinc-500">Track orders, save addresses, and more.</p>
      <Suspense>
        <AccountLoginForm />
      </Suspense>
    </div>
  );
}
