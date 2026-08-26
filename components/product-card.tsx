import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { WishlistButton } from "@/components/wishlist-button";

export function ProductCard({
  product,
  isWishlisted = false,
}: {
  product: Product;
  isWishlisted?: boolean;
}) {
  const image = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];
  const prices = product.product_variants.map((v) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : product.base_price;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-xl hover:shadow-black/5">
      <WishlistButton productId={product.id} initialSaved={isWishlisted} floating />
      <Link href={`/products/${product.id}`} className="flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
          {image ? (
            <Image
              src={image.url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No image
            </div>
          )}
          {product.category && (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-700 backdrop-blur">
              {product.category}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 p-4">
          <h3 className="font-semibold leading-snug group-hover:text-brand">
            {product.name}
          </h3>
          <p className="mt-1 font-bold text-brand">
            from {formatPrice(minPrice)}
          </p>
        </div>
      </Link>
    </div>
  );
}
