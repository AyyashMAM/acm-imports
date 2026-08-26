import type { Metadata } from "next";
import Link from "next/link";
import { getMyWishlistProducts } from "@/lib/account/wishlist-data";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const products = await getMyWishlistProducts();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Wishlist</h1>

      {products.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Nothing saved yet.{" "}
          <Link href="/products" className="font-semibold text-brand hover:underline">
            Browse products →
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isWishlisted />
          ))}
        </div>
      )}
    </div>
  );
}
