export const SITE_NAME = "The Glow Shop";

export const SITE_DESCRIPTION =
  "Imported cosmetics, chocolates, and fancy finds, delivered to your door. Cash on delivery available.";

// Swap NEXT_PUBLIC_SITE_URL for your real domain once you've picked one
// (see app/layout.tsx metadataBase, app/sitemap.ts, app/robots.ts).
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://theglowshop.lk"
);
