"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { totalItems } = useCart();

  return (
    <div className="sticky top-0 z-10">
      <div className="bg-brand py-2 text-center text-xs font-medium text-white sm:text-sm">
        💵 Cash on delivery available &nbsp;·&nbsp; 🚚 Fast nationwide shipping
      </div>
      <header className="border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm text-white">
              AC
            </span>
            ACM Imports
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/products" className="hover:text-brand">
              Shop
            </Link>
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
