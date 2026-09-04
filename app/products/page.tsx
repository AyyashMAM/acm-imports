import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { getMyWishlistProductIds } from "@/lib/account/wishlist-data";
import { ProductCard } from "@/components/product-card";
import { BrandFilter } from "@/components/brand-filter";
import type { Product } from "@/lib/types";
import { CATEGORY_INTROS } from "@/lib/product-seo";
import { isProductCategory } from "@/lib/category-fields";

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const { category, brand, q } = await searchParams;
  const c = Array.isArray(category) ? category[0] : category;
  const b = Array.isArray(brand) ? brand[0] : brand;
  const query = Array.isArray(q) ? q[0] : q;

  // A search query or a brand-only filter isn't a distinct page worth
  // indexing on its own (thin/duplicate content risk) — still crawlable
  // (follow) so links to real products keep flowing, just not indexed.
  if (query) {
    return {
      title: `Search: ${query}`,
      description: `Products matching "${query}" — imported cosmetics, chocolates & fancy finds.`,
      robots: { index: false, follow: true },
      alternates: { canonical: "/products" },
    };
  }

  if (!c) {
    if (b) {
      return {
        title: `${b} products`,
        description: `Shop ${b} products — imported picks at honest prices, cash on delivery available.`,
        robots: { index: false, follow: true },
        alternates: { canonical: "/products" },
      };
    }
    return {
      title: "Shop all products",
      description:
        "Browse our full range of imported cosmetics, chocolates, and fancy finds. Cash on delivery available.",
      alternates: { canonical: "/products" },
    };
  }

  const canonical = `/products?category=${encodeURIComponent(c)}`;
  if (b) {
    return {
      title: `${b} ${c} products`,
      description: `Shop ${b} ${c.toLowerCase()} — imported picks at honest prices, cash on delivery available.`,
      robots: { index: false, follow: true },
      alternates: { canonical },
    };
  }

  return {
    title: `${c} products`,
    description: `Shop ${c.toLowerCase()} — imported picks at honest prices, cash on delivery available.`,
    alternates: { canonical },
  };
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const { category, brand, q } = await searchParams;
  const activeCategory = Array.isArray(category) ? category[0] : category;
  const activeBrand = Array.isArray(brand) ? brand[0] : brand;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  const products = await getActiveProducts();
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((c): c is string => Boolean(c))
    )
  ).sort();
  const brands = Array.from(
    new Set(
      products
        .map((p) => p.brand)
        .filter((b): b is string => Boolean(b))
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredProducts = products.filter(
    (p) =>
      (!activeCategory || p.category === activeCategory) &&
      (!activeBrand || p.brand === activeBrand) &&
      matchesQuery(p, query)
  );

  function matchesQuery(product: Product, q: string): boolean {
    if (!q) return true;
    const haystack = [product.name, product.brand, product.category, product.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return q
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every((word) => haystack.includes(word));
  }

  // Category links preserve whatever brand filter is active so the two can
  // be combined; the brand <select> (client-side) does the same in reverse.
  function categoryHref(c: string | null) {
    const params = new URLSearchParams();
    if (c) params.set("category", c);
    if (activeBrand) params.set("brand", activeBrand);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div>
      <div className="border-b border-black/10 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-zinc-900">
            {query ? `Results for "${query}"` : (activeCategory ?? "Shop all")}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-zinc-600">
            {query
              ? `Products matching "${query}" from our full catalog.`
              : isProductCategory(activeCategory)
                ? CATEGORY_INTROS[activeCategory]
                : "Cosmetics, chocolates & fancy finds — imported, honest prices, cash on delivery."}
          </p>
        </div>
      </div>

      {(categories.length > 0 || brands.length > 0) && (
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 0 && (
              <>
                <Link
                  href={categoryHref(null)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    !activeCategory
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  All
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c}
                    href={categoryHref(c)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      activeCategory === c
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {c}
                  </Link>
                ))}
              </>
            )}
            {brands.length > 0 && (
              <div className="ml-auto">
                <BrandFilter brands={brands} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-12">
        {filteredProducts.length === 0 ? (
          <p className="text-zinc-500">
            {query
              ? `No products match "${query}"${activeCategory ? ` in ${activeCategory.toLowerCase()}` : ""}${activeBrand ? ` from ${activeBrand}` : ""}. Try a different keyword.`
              : activeCategory && activeBrand
                ? `No ${activeBrand} ${activeCategory.toLowerCase()} products yet — check back soon.`
                : activeCategory
                  ? `No ${activeCategory.toLowerCase()} products yet — check back soon.`
                  : activeBrand
                    ? `No ${activeBrand} products yet — check back soon.`
                    : "No products yet — check back soon."}
          </p>
        ) : (
          <Suspense fallback={<ProductGrid products={filteredProducts} wishlistedIds={new Set()} />}>
            <WishlistedProductGrid products={filteredProducts} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

async function WishlistedProductGrid({ products }: { products: Product[] }) {
  const wishlistedIds = await getMyWishlistProductIds();
  return <ProductGrid products={products} wishlistedIds={wishlistedIds} />;
}

function ProductGrid({
  products,
  wishlistedIds,
}: {
  products: Product[];
  wishlistedIds: Set<string>;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistedIds.has(product.id)}
        />
      ))}
    </div>
  );
}
