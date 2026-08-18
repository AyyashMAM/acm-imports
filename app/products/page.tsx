import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse our full range of quality imported goods. Cash on delivery available.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div>
      <div className="border-b border-black/10 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Shop all</h1>
          <p className="mt-2 text-zinc-600">
            Quality imports, honest prices, cash on delivery.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {products.length === 0 ? (
          <p className="text-zinc-500">No products yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
