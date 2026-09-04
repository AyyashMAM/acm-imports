import type { Product } from "@/lib/types";
import { isProductCategory, type ProductCategory } from "@/lib/category-fields";
import { SITE_URL } from "@/lib/seo";

// Attribute keys tried in order per category when looking for a "key
// attribute" to differentiate a title — first one present on the product
// wins. See lib/category-fields.ts for what each category actually collects.
const KEY_ATTRIBUTE_FIELDS: Record<ProductCategory, string[]> = {
  Cosmetics: ["shade", "net_weight"],
  Chocolate: ["flavor", "net_weight"],
  "Fancy Items": ["material", "color", "dimensions"],
  "Household Items": ["material", "dimensions", "power_rating"],
};

function keyAttributeFor(product: Product): string | null {
  if (!isProductCategory(product.category)) return null;
  for (const key of KEY_ATTRIBUTE_FIELDS[product.category]) {
    const value = product.attributes[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

// Builds a unique, keyword-rich title without manually appending the site
// name — app/layout.tsx already applies the "%s | Liora" template. Brand and
// key-attribute are only added when they aren't already part of the product
// name, since this catalog's names already tend to include both (e.g.
// "Keune Tinta Color 6.53 Dark Mahogany Golden Blonde 60ml").
export function buildProductTitle(product: Product): string {
  const name = product.name.trim();
  const lowerName = name.toLowerCase();

  const brand = product.brand?.trim();
  const withBrand = brand && !lowerName.startsWith(brand.toLowerCase()) ? `${brand} ${name}` : name;

  const attr = keyAttributeFor(product);
  const withAttr =
    attr && !withBrand.toLowerCase().includes(attr.toLowerCase()) ? `${withBrand} - ${attr}` : withBrand;

  return withAttr;
}

// Strips newlines/extra whitespace and truncates at a word boundary so the
// result reads naturally in search results (default target: 150-160 chars).
export function buildMetaDescription(
  text: string | null | undefined,
  fallback: string,
  max = 160
): string {
  const source = text?.trim() ? text : fallback;
  const clean = source.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max - 1).trim()}…`;
}

// Short, unique intro copy shown above each category's product grid — not
// just a bare listing. Keyed by the fixed category taxonomy in
// lib/category-fields.ts.
export const CATEGORY_INTROS: Record<ProductCategory, string> = {
  Cosmetics:
    "Imported cosmetics at honest prices — hair colour, skincare, and beauty essentials from trusted international brands. Every item ships nationwide with cash on delivery, no online payment required.",
  Chocolate:
    "Imported chocolates and confectionery, sourced from brands you won't find on every corner. Fresh stock, honest prices, and cash on delivery across Sri Lanka.",
  "Fancy Items":
    "Fancy finds and decorative pieces for gifting or treating yourself — imported, handpicked, and priced fairly. Nationwide delivery with cash on delivery available.",
  "Household Items":
    "Everyday household essentials, imported and quality-checked before they ship. Order online and pay cash on delivery when it arrives.",
};

function priceValidUntil(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
}

export function buildProductJsonLd(product: Product, canonicalPath: string) {
  const images = [...product.product_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url);
  const url = new URL(canonicalPath, SITE_URL).toString();
  const prices = product.product_variants.map((v) => v.price);
  const price = prices.length ? Math.min(...prices) : product.base_price;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    url,
    image: images,
    category: product.category ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url,
      price,
      priceCurrency: "LKR",
      availability: product.product_variants.some((v) => v.stock_quantity > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: priceValidUntil(),
    },
    // No aggregateRating/review: this store has no reviews feature yet.
    // Fabricating rating data violates Google's structured data guidelines
    // and risks a manual action — add this once real reviews exist.
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, SITE_URL).toString(),
    })),
  };
}
