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
    <div className="group relative flex flex-col overflow-hidden border border-black/10 bg-white transition-shadow hover:shadow-lg hover:shadow-black/5">
      <WishlistButton productId={product.id} initialSaved={isWishlisted} floating />
      <Link href={`/products/${product.id}`} className="flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
          {image ? (
            <Image
              src={image.url}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          <span className="absolute bottom-2 right-0 origin-bottom-right rotate-2 bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-zinc-900 shadow-[-2px_2px_6px_rgba(0,0,0,.14)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-0">
            {formatPrice(minPrice)}
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <h3 className="font-display italic leading-snug text-zinc-900 group-hover:text-brand">
            {product.name}
          </h3>
        </div>
      </Link>
    </div>
  );
}
