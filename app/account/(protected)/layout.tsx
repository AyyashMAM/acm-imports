import Link from "next/link";
import { requireAccountUser } from "@/lib/account/auth";
import { signOutAccount } from "../actions";

const NAV_LINKS = [
  { href: "/account", label: "My account" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  await requireAccountUser();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
        <nav className="flex items-center gap-5 text-sm font-semibold text-zinc-600">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className="hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={signOutAccount}>
          <button
            type="submit"
            className="text-sm font-semibold text-zinc-500 hover:text-red-600"
          >
            Log out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
