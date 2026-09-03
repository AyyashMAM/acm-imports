import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductById, getRelatedProducts } from "@/lib/products";
import { AddToCart } from "@/components/add-to-cart";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
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
  const product = await getProductById(id);
  if (!product) notFound();

  const images = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const specs = isProductCategory(product.category)
    ? CATEGORY_FIELDS[product.category]
        .map((field) => ({ label: field.label, value: product.attributes[field.key] }))
        .filter(
          (spec): spec is { label: string; value: string | boolean | string[] } =>
            spec.value !== undefined &&
            spec.value !== "" &&
            !(Array.isArray(spec.value) && spec.value.length === 0)
        )
    : [];

  const benefits = (product.benefits ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const howToUse = (product.how_to_use ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const relatedProducts = await getRelatedProducts(product.category, product.id);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    category: product.category ?? undefined,
    brand: product.brand ?? undefined,
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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="grid gap-10 sm:grid-cols-2">
        <ProductGallery images={images} productName={product.name} />

        <div className="flex flex-col gap-4">
          {product.category && (
            <p className="w-fit rounded-full bg-brand-light px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
              {product.category}
            </p>
          )}
          {product.brand && (
            <p className="text-sm font-semibold text-zinc-500">{product.brand}</p>
          )}
          <h1 className="font-display text-3xl font-semibold italic tracking-tight text-zinc-900">
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
                    {typeof spec.value === "boolean"
                      ? spec.value
                        ? "Yes"
                        : "No"
                      : Array.isArray(spec.value)
                        ? spec.value.join(", ")
                        : spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <AddToCart product={product} />
            </div>
            <Suspense fallback={<WishlistButton productId={product.id} initialSaved={false} />}>
              <WishlistStatus productId={product.id} />
            </Suspense>
          </div>
        </div>
      </div>

      {(benefits.length > 0 || howToUse.length > 0 || product.ingredients) && (
        <div className="mt-16 grid gap-10 border-t border-black/10 pt-10 sm:grid-cols-2">
          {benefits.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold">Benefits</h2>
              <ul className="flex flex-col gap-2 text-sm text-zinc-600">
                {benefits.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-brand">•</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {howToUse.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold">How to use</h2>
              <ol className="flex flex-col gap-2 text-sm text-zinc-600">
                {howToUse.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-brand">{i + 1}.</span>
                    {line}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {product.ingredients && (
            <div className="sm:col-span-2">
              <h2 className="mb-3 text-lg font-bold">Ingredients</h2>
              <p className="text-sm text-zinc-600">{product.ingredients}</p>
            </div>
          )}
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-black/10 pt-10">
          <h2 className="mb-6 text-xl font-extrabold tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function WishlistStatus({ productId }: { productId: string }) {
  const wishlisted = await isProductWishlisted(productId);
  return <WishlistButton productId={productId} initialSaved={wishlisted} />;
}
