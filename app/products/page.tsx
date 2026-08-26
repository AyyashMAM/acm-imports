import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { getMyWishlistProductIds } from "@/lib/account/wishlist-data";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const { category } = await searchParams;
  const c = Array.isArray(category) ? category[0] : category;

  if (!c) {
    return {
      title: "Shop all products",
      description:
        "Browse our full range of imported cosmetics, chocolates, and fancy finds. Cash on delivery available.",
      alternates: { canonical: "/products" },
    };
  }

  return {
    title: `${c} products`,
    description: `Shop ${c.toLowerCase()} — imported picks at honest prices, cash on delivery available.`,
    alternates: { canonical: `/products?category=${encodeURIComponent(c)}` },
  };
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const { category } = await searchParams;
  const activeCategory = Array.isArray(category) ? category[0] : category;

  const [products, wishlistedIds] = await Promise.all([
    getActiveProducts(),
    getMyWishlistProductIds(),
  ]);
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((c): c is string => Boolean(c))
    )
  ).sort();

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <div>
      <div className="border-b border-black/10 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {activeCategory ?? "Shop all"}
          </h1>
          <p className="mt-2 text-zinc-600">
            Cosmetics, chocolates &amp; fancy finds — imported, honest prices, cash on delivery.
          </p>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
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
                href={`/products?category=${encodeURIComponent(c)}`}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeCategory === c
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-12">
        {filteredProducts.length === 0 ? (
          <p className="text-zinc-500">
            {activeCategory
              ? `No ${activeCategory.toLowerCase()} products yet — check back soon.`
              : "No products yet — check back soon."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistedIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
