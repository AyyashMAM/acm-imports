import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold tracking-tight">Admin login</h1>
        <p className="mb-6 text-sm text-zinc-500">The Glow Shop</p>
        <LoginForm />
      </div>
    </div>
  );
}
