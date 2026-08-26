"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reports", label: "Reports" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch={false}
          onClick={onNavigate}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            isActive(pathname, link.href)
              ? "bg-brand-light text-brand-dark"
              : "text-zinc-600 hover:bg-black/[.04] hover:text-zinc-900"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminSidebar({ signOutAction }: { signOutAction: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 sm:hidden print:hidden">
        <span className="text-lg font-extrabold tracking-tight">
          Liora <span className="text-zinc-400">Admin</span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 sm:hidden print:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col gap-6 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold tracking-tight">
                Liora <span className="text-zinc-400">Admin</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10"
              >
                ✕
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <form action={signOutAction} className="mt-auto">
              <button
                type="submit"
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-zinc-500 hover:bg-black/[.04] hover:text-red-600"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-black/10 bg-white p-4 sm:flex print:hidden">
        <span className="px-2 text-lg font-extrabold tracking-tight">
          Liora <span className="text-zinc-400">Admin</span>
        </span>
        <NavLinks pathname={pathname} />
        <form action={signOutAction} className="mt-auto">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-zinc-500 hover:bg-black/[.04] hover:text-red-600"
          >
            Log out
          </button>
        </form>
      </aside>
    </>
  );
}
