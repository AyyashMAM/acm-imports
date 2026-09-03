"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { AccountNavLink } from "@/components/account-nav-link";
import { SearchBar } from "@/components/search-bar";

export function Header() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="sticky top-0 z-40">
      <div className="bg-brand py-2 text-center text-xs font-medium text-white sm:text-sm">
        💵 Cash on delivery available &nbsp;·&nbsp; 🚚 Fast nationwide shipping
      </div>
      <header className="border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              L
            </span>
            <span className="hidden font-display text-2xl font-semibold italic sm:inline">
              Liora
            </span>
          </Link>
          <Suspense
            fallback={
              <div className="min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
                <div className="h-9 w-full rounded-full border border-black/10 bg-zinc-100" />
              </div>
            }
          >
            <SearchBar className="min-w-0 flex-1 sm:max-w-xs md:max-w-sm" />
          </Suspense>
          <nav className="flex shrink-0 items-center gap-6 text-sm font-semibold">
            <Link href="/products" className="hidden hover:text-brand sm:inline">
              Shop
            </Link>
            <AccountNavLink />
            <Link
              href="/cart"
              className="flex items-center gap-1.5 hover:text-brand"
            >
              Cart
              {totalItems > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}
