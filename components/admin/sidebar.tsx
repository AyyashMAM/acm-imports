"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5a.5.5 0 0 1-.5-.5V13a2 2 0 0 0-4 0v3.5a.5.5 0 0 1-.5.5H4a1 1 0 0 1-1-1V9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 6.5 10 3l7 3.5-7 3.5-7-3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3 6.5V14l7 3.5 7-3.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 10v7.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3.5" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="12.5" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 5.5h.01M6 14.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 5h12l-1.2 8.4a1.5 1.5 0 0 1-1.48 1.28H6.68a1.5 1.5 0 0 1-1.48-1.28L4 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8.5" cy="17.5" r="0.9" fill="currentColor" />
      <circle cx="12.5" cy="17.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="7" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 16.5c0-2.5 2.2-4.25 5-4.25s5 1.75 5 4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.5 5a2.5 2.5 0 0 1 0 4.9M15.5 12.6c1.8.5 3 1.7 3 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 16.5V16.5A1 1 0 0 1 4 16V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="4" y="10" width="3" height="6.5" rx="0.8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="6" width="3" height="10.5" rx="0.8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="3" width="3" height="13.5" rx="0.8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M8 3.5H5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 5 16.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 13.5 17 10l-4-3.5M17 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/admin", label: "Overview", Icon: OverviewIcon },
  { href: "/admin/products", label: "Products", Icon: ProductsIcon },
  { href: "/admin/stock", label: "Stock", Icon: StockIcon },
  { href: "/admin/orders", label: "Orders", Icon: OrdersIcon },
  { href: "/admin/customers", label: "Customers", Icon: CustomersIcon },
  { href: "/admin/reports", label: "Reports", Icon: ReportsIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              active
                ? "bg-brand text-white shadow-sm"
                : "text-zinc-600 hover:bg-black/[.04] hover:text-zinc-900"
            }`}
          >
            <span className={active ? "text-white" : "text-zinc-400"}>
              <Icon />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ signOutAction }: { signOutAction: () => void }) {
  return (
    <form action={signOutAction} className="mt-auto">
      <button
        type="submit"
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <LogoutIcon />
        Log out
      </button>
    </form>
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
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 transition-colors hover:bg-black/[.04] active:scale-95"
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
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 transition-colors hover:bg-black/[.04] active:scale-95"
              >
                ✕
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <LogoutButton signOutAction={signOutAction} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-black/10 bg-white p-4 sm:flex print:hidden">
        <span className="px-2 text-lg font-extrabold tracking-tight">
          Liora <span className="text-zinc-400">Admin</span>
        </span>
        <NavLinks pathname={pathname} />
        <LogoutButton signOutAction={signOutAction} />
      </aside>
    </>
  );
}
