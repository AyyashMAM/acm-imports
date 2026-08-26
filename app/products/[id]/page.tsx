import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { AddToCart } from "@/components/add-to-cart";
import { WishlistButton } from "@/components/wishlist-button";
import { isProductWishlisted } from "@/app/account/actions";
import { CATEGORY_FIELDS, isProductCategory } from "@/lib/category-fields";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};

  const image = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  )[0];
  const description =
    product.description ?? `Buy ${product.name} online. Cash on delivery available.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image.url, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, wishlisted] = await Promise.all([
    getProductById(id),
    isProductWishlisted(id),
  ]);
  if (!product) notFound();

  const images = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const specs = isProductCategory(product.category)
    ? CATEGORY_FIELDS[product.category]
        .map((field) => ({ label: field.label, value: product.attributes[field.key] }))
        .filter(
          (spec): spec is { label: string; value: string | boolean } =>
            spec.value !== undefined && spec.value !== ""
        )
    : [];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    category: product.category ?? undefined,
    image: images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: product.base_price,
      priceCurrency: "LKR",
      availability: product.product_variants.some((v) => v.stock_quantity > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
        {images[0] ? (
          <Image
            src={images[0].url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {product.category && (
          <p className="w-fit rounded-full bg-brand-light px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
            {product.category}
          </p>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight">
          {product.name}
        </h1>
        {product.description && (
          <p className="text-zinc-600">
            {product.description}
          </p>
        )}
        {specs.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-black/10 pt-4 text-sm">
            {specs.map((spec) => (
              <div key={spec.label} className="contents">
                <dt className="text-zinc-500">{spec.label}</dt>
                <dd className="font-medium">
                  {typeof spec.value === "boolean" ? (spec.value ? "Yes" : "No") : spec.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <AddToCart product={product} />
          </div>
          <WishlistButton productId={product.id} initialSaved={wishlisted} />
        </div>
      </div>
    </div>
  );
}
