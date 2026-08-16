import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-extrabold tracking-tight">ACM Imports</p>
          <p className="mt-1 text-sm text-zinc-500">
            Quality imported goods, delivered to your door.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
          <Link href="/products" className="hover:text-brand">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-brand">
            Cart
          </Link>
          <span className="text-zinc-500">
            💵 Cash on delivery available
          </span>
        </div>
      </div>
      <div className="border-t border-black/10 py-4 text-center text-xs text-zinc-500">
        &copy; {new Date().getFullYear()} ACM Imports. All rights reserved.
      </div>
    </footer>
  );
}
