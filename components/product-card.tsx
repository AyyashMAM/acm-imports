import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const image = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];
  const prices = product.product_variants.map((v) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : product.base_price;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-xl hover:shadow-black/5"
    >
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
          from ${minPrice.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
