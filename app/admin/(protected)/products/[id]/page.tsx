import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/admin/products-data";
import { ImageManager } from "@/components/admin/image-manager";
import {
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from "./actions";

export async function generateMetadata({
  params,
}: PageProps<"/admin/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProductById(id);
  return { title: product?.name ?? "Product" };
}

export default async function AdminProductEditPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);
  const createVariantWithId = createVariant.bind(null, product.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold tracking-tight">{product.name}</h1>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Details</h2>
        <form action={updateProductWithId} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              name="name"
              defaultValue={product.name}
              required
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input
              name="category"
              defaultValue={product.category ?? ""}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              name="description"
              defaultValue={product.description ?? ""}
              rows={3}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Display price</label>
            <input
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.base_price}
              required
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={product.is_active}
            />
            Visible in the storefront
          </label>
          <button
            type="submit"
            className="mt-2 w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
          >
            Save details
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Images</h2>
        <ImageManager productId={product.id} images={product.product_images} />
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Variants</h2>
        <div className="flex flex-col gap-4">
          {product.product_variants.map((variant) => (
            <form
              key={variant.id}
              action={updateVariant.bind(null, variant.id)}
              className="grid grid-cols-2 gap-3 rounded-lg border border-black/10 p-4 sm:grid-cols-5 sm:items-end"
            >
              <input type="hidden" name="product_id" value={product.id} />
              <div>
                <label className="mb-1 block text-xs font-medium">Label</label>
                <input
                  name="label"
                  defaultValue={variant.label}
                  required
                  className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Sell price</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={variant.price}
                  required
                  className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Cost price</label>
                <input
                  name="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={variant.cost_price ?? ""}
                  className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Stock</label>
                <input
                  name="stock_quantity"
                  type="number"
                  min="0"
                  defaultValue={variant.stock_quantity}
                  required
                  className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs font-medium">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={variant.is_active}
                  />
                  Active
                </label>
                <button
                  type="submit"
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800"
                >
                  Save
                </button>
              </div>
              <div className="col-span-2 sm:col-span-5">
                <button
                  type="submit"
                  formAction={deleteVariant.bind(null, variant.id, product.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete variant
                </button>
              </div>
            </form>
          ))}
        </div>

        <form
          action={createVariantWithId}
          className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-dashed border-black/20 p-4 sm:grid-cols-5 sm:items-end"
        >
          <div>
            <label className="mb-1 block text-xs font-medium">Label</label>
            <input
              name="label"
              required
              placeholder="e.g. Red / Large"
              className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Sell price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Cost price</label>
            <input
              name="cost_price"
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Stock</label>
            <input
              name="stock_quantity"
              type="number"
              min="0"
              defaultValue={0}
              required
              className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-bold hover:bg-black/[.04]"
          >
            + Add variant
          </button>
        </form>
      </section>
    </div>
  );
}
