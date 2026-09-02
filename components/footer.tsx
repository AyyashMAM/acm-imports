"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-xl font-semibold italic tracking-tight">Liora</p>
          <p className="mt-1 text-sm text-zinc-500">
            Imported cosmetics, chocolates &amp; fancy finds, delivered to your door.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <Link href="/products" className="hover:text-brand">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-brand">
            Cart
          </Link>
          <Link href="/account" className="hover:text-brand">
            Account
          </Link>
          <Link href="/track-order" className="hover:text-brand">
            Track order
          </Link>
          <span className="text-zinc-500">
            💵 Cash on delivery available
          </span>
        </div>
      </div>
      <div className="border-t border-black/10 py-4 text-center text-xs text-zinc-500">
        &copy; {new Date().getFullYear()} Liora. All rights reserved.
      </div>
    </footer>
  );
}
