"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOnProducts = pathname === "/products";
  const urlQuery = isOnProducts ? searchParams.get("q") ?? "" : "";
  const [value, setValue] = useState(urlQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stay in sync if the query changes from elsewhere (e.g. a cleared filter,
  // or landing here fresh from a link with no ?q= at all) — adjusted during
  // render rather than an effect, per https://react.dev/learn/you-might-not-need-an-effect.
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setValue(urlQuery);
  }

  function navigate(query: string) {
    // Only carry over other filters (category/brand) when already on the
    // results page; a search from elsewhere in the site starts fresh.
    const params = new URLSearchParams(isOnProducts ? searchParams.toString() : "");
    if (query) params.set("q", query);
    else params.delete("q");
    const qs = params.toString();
    const url = qs ? `/products?${qs}` : "/products";
    // Replace while refining on the results page (no history spam per
    // keystroke); push when starting a new search from another page, so
    // back still returns where the customer came from.
    if (isOnProducts) router.replace(url);
    else router.push(url);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(next), 250);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(value);
  }

  function handleClear() {
    setValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Only navigate if there's an active search to clear; otherwise this is
    // just resetting an unsubmitted keystroke on some other page.
    if (isOnProducts) navigate("");
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search products…"
        aria-label="Search products"
        autoComplete="off"
        className="w-full rounded-full border border-black/10 bg-zinc-100 py-2 pl-9 pr-8 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
