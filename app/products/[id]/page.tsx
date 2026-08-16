import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { AddToCart } from "@/components/add-to-cart";

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

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-2">
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
        <AddToCart product={product} />
      </div>
    </div>
  );
}
