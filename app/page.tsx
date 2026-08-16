import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { PromoCarousel } from "@/components/promo-carousel";
import { ProductCarousel } from "@/components/product-carousel";

const FEATURES = [
  {
    icon: "💵",
    title: "Cash on delivery",
    text: "Pay when your order arrives at your door.",
  },
  {
    icon: "🚚",
    title: "Fast shipping",
    text: "Quick nationwide delivery on every order.",
  },
  {
    icon: "✅",
    title: "Quality checked",
    text: "Every item inspected before it ships.",
  },
];

export default async function Home() {
  const products = await getActiveProducts();
  const featured = products.slice(0, 8);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand-dark">
            Now shipping nationwide
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            Quality imports,
            <br />
            <span className="text-brand">delivered to your door</span>
          </h1>
          <p className="max-w-xl text-lg text-zinc-600">
            Handpicked imported goods at honest prices. Order online and pay
            cash on delivery — no hassle, no surprises.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-transform hover:scale-105 hover:bg-zinc-800"
            >
              Shop now
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <PromoCarousel />
      </section>

      <section className="border-y border-black/10 bg-zinc-50">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold">{f.title}</h3>
              <p className="text-sm text-zinc-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight">
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
