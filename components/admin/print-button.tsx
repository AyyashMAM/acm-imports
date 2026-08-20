"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark print:hidden"
    >
      Print
    </button>
  );
}
