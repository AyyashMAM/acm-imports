import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/auth";
import { signOutAdmin } from "./actions";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminProtectedLayout({
  children,
}: LayoutProps<"/admin">) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-zinc-50 print:bg-white">
      <header className="border-b border-black/10 bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-lg font-extrabold tracking-tight">
              Liora <span className="text-zinc-400">Admin</span>
            </span>
            <nav className="flex items-center gap-5 text-sm font-semibold text-zinc-600">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="text-sm font-semibold text-zinc-500 hover:text-red-600"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
