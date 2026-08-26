"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toggleWishlist } from "@/app/account/actions";

export function WishlistButton({
  productId,
  initialSaved = false,
  floating = false,
}: {
  productId: string;
  initialSaved?: boolean;
  floating?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      // If the visitor wasn't logged in, the action redirects the page to
      // /account/login instead of resolving normally — nothing to set here.
      if (result) setSaved(result.saved);
    });
    if (!saved) {
      // Optimistic: avoids a flash of the empty heart before the RPC resolves.
      router.prefetch(`/account/login?redirect=${encodeURIComponent(pathname)}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={
        floating
          ? "absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur transition-colors hover:text-brand disabled:opacity-60"
          : "flex h-11 w-11 items-center justify-center rounded-full border border-black/15 transition-colors hover:text-brand disabled:opacity-60"
      }
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className={saved ? "fill-brand stroke-brand" : "fill-none stroke-current"}
      >
        <path
          d="M8 13.5s-5.5-3.36-5.5-7.16C2.5 4.2 4.1 2.75 6 2.75c1.1 0 2 .55 2 .55s.9-.55 2-.55c1.9 0 3.5 1.45 3.5 3.59 0 3.8-5.5 7.16-5.5 7.16Z"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
