import Image from "next/image";
import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { formatPrice } from "@/lib/currency";
import { PromoCarousel } from "@/components/promo-carousel";
import { ProductCarousel } from "@/components/product-carousel";
import type { Product } from "@/lib/types";

const FEATURES = [
  {
    title: "Cash on delivery",
    text: "Pay when your order arrives at your door.",
  },
  {
    title: "Fast shipping",
    text: "Quick nationwide delivery on every order.",
  },
  {
    title: "Quality checked",
    text: "Every item inspected before it ships.",
  },
];

// Three tilted product photos behind the hero headline, standing in for
// the shelf — positions are hand-tuned, so only ever the first three
// in-stock products with a photo are used.
const TAG_POSITIONS = [
  "left-0 top-0 z-30 h-[78%] w-[58%] -rotate-3",
  "right-0 top-[6%] z-20 h-[54%] w-[46%] rotate-6",
  "bottom-0 left-[16%] z-10 h-[40%] w-[44%] -rotate-2",
];

function minPrice(product: Product) {
  const prices = product.product_variants.map((v) => v.price);
  return prices.length ? Math.min(...prices) : product.base_price;
}

export default async function Home() {
  const products = await getActiveProducts();
  const featured = products.slice(0, 8);
  const heroProducts = featured
    .filter((p) => p.product_images.length > 0)
    .slice(0, 3);

  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="rounded-full bg-brand-light px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-dark">
              Now shipping nationwide
            </span>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-tight text-zinc-900 sm:text-6xl">
              Small luxuries,
              <br />
              <span className="font-display italic text-brand">
                worth unwrapping.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-zinc-600">
              Handpicked imported cosmetics, chocolates, and fancy finds at
              honest prices. Order online and pay cash on delivery — no
              hassle, no surprises.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-transform hover:scale-105 hover:bg-zinc-800"
              >
                Shop now
              </Link>
              <Link
                href="/track-order"
                className="rounded-full border border-black/15 px-8 py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand hover:text-brand-dark"
              >
                Track an order
              </Link>
            </div>
          </div>

          {heroProducts.length > 0 && (
            <div className="relative isolate hidden h-[380px] sm:block">
              {heroProducts.map((product, i) => {
                const image = [...product.product_images].sort(
                  (a, b) => a.sort_order - b.sort_order
                )[0];
                return (
                  <div
                    key={product.id}
                    className={`absolute overflow-hidden rounded-sm bg-zinc-100 shadow-xl shadow-black/10 ${TAG_POSITIONS[i]}`}
                  >
                    <Image
                      src={image.url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                    <span className="absolute bottom-2 right-0 origin-bottom-right rotate-2 bg-white px-2 py-1 font-mono text-[10px] font-medium text-zinc-900 shadow-[-2px_2px_6px_rgba(0,0,0,.14)]">
                      {formatPrice(minPrice(product))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <PromoCarousel />
      </section>

      <section className="border-y border-black/10">
        <div className="mx-auto flex max-w-6xl flex-col divide-y divide-black/10 sm:flex-row sm:divide-x sm:divide-y-0">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex-1 px-6 py-6 sm:px-8">
              <p className="font-semibold text-zinc-900">{f.title}</p>
              <p className="mt-1 text-sm text-zinc-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-900">
              Featured products
            </h2>
            <Link
              href="/products"
              className="text-sm font-semibold text-brand hover:text-brand-dark"
            >
              View all &rarr;
            </Link>
          </div>
          <ProductCarousel products={featured} />
        </section>
      )}
    </div>
  );
}
