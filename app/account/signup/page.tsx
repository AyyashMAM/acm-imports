import type { Metadata } from "next";
import { SignupForm } from "@/components/account/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function AccountSignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-xl font-bold tracking-tight">Create your account</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Track orders, save addresses, and build a wishlist.
      </p>
      <SignupForm />
    </div>
  );
}
