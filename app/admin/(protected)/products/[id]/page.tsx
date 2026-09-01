import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/admin/products-data";
import { ImageManager } from "@/components/admin/image-manager";
import { CategoryAttributeFields } from "@/components/admin/category-attribute-fields";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { SalePriceField } from "@/components/admin/sale-price-field";
import { VariantPriceFields } from "@/components/admin/variant-price-fields";
import { PRODUCT_STATUSES } from "@/lib/admin/types";
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
            <label className="mb-1 block text-sm font-medium">SKU</label>
            <input
              name="sku"
              defaultValue={product.sku ?? ""}
              placeholder="Product-level SKU"
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <CategoryAttributeFields
            defaultCategory={product.category}
            defaultAttributes={product.attributes}
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Brand</label>
            <input
              name="brand"
              defaultValue={product.brand ?? ""}
              placeholder="e.g. La Roche-Posay"
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
            <label className="mb-1 block text-sm font-medium">Benefits</label>
            <textarea
              name="benefits"
              defaultValue={product.benefits ?? ""}
              rows={3}
              placeholder={"One per line, e.g.\nRepairs damaged skin\nSoothes irritation"}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">How to use</label>
            <textarea
              name="how_to_use"
              defaultValue={product.how_to_use ?? ""}
              rows={3}
              placeholder={"One step per line, e.g.\nApply to clean skin\nMassage gently"}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Ingredients</label>
            <textarea
              name="ingredients"
              defaultValue={product.ingredients ?? ""}
              rows={3}
              placeholder="Full ingredient list"
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Display price (LKR)</label>
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
          <SalePriceField defaultIsOnSale={product.is_on_sale} defaultSalePrice={product.sale_price} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="cruelty_free" defaultChecked={product.cruelty_free} />
              Cruelty-free
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="vegan" defaultChecked={product.vegan} />
              Vegan
            </label>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              name="status"
              defaultValue={product.status}
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            >
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Only Published products are visible in the storefront.
            </p>
          </div>
          <SubmitButton
            pendingText="Saving..."
            className="mt-2 w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md active:scale-[0.98]"
          >
            Save details
          </SubmitButton>
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
              className="grid grid-cols-2 gap-3 rounded-lg border border-black/10 p-4 sm:grid-cols-4 sm:items-end"
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
              <VariantPriceFields defaultPrice={variant.price} defaultCostPrice={variant.cost_price} />
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
              <div>
                <label className="mb-1 block text-xs font-medium">Low stock at</label>
                <input
                  name="low_stock_threshold"
                  type="number"
                  min="0"
                  defaultValue={variant.low_stock_threshold ?? ""}
                  placeholder="Store default"
                  className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">SKU</label>
                <input
                  name="sku"
                  defaultValue={variant.sku ?? ""}
                  className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Barcode</label>
                <input
                  name="barcode"
                  defaultValue={variant.barcode ?? ""}
                  className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Expiry / batch date</label>
                <input
                  name="expiry_date"
                  type="date"
                  defaultValue={variant.expiry_date ?? ""}
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
                <SubmitButton
                  pendingText="Saving..."
                  className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md active:scale-[0.98]"
                >
                  Save
                </SubmitButton>
              </div>
              <div className="col-span-2 sm:col-span-4">
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
          className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-dashed border-black/20 p-4 sm:grid-cols-4 sm:items-end"
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
          <VariantPriceFields />
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
          <div>
            <label className="mb-1 block text-xs font-medium">Low stock at</label>
            <input
              name="low_stock_threshold"
              type="number"
              min="0"
              placeholder="Store default"
              className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">SKU</label>
            <input
              name="sku"
              className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Barcode</label>
            <input
              name="barcode"
              className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Expiry / batch date</label>
            <input
              name="expiry_date"
              type="date"
              className="w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm"
            />
          </div>
          <SubmitButton
            pendingText="Adding..."
            className="flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-xs font-bold transition-colors hover:border-brand hover:bg-brand-light/40 hover:text-brand-dark"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Add variant
          </SubmitButton>
        </form>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/40 p-6">
        <h2 className="mb-1 text-lg font-bold text-red-900">Danger zone</h2>
        <p className="mb-4 text-sm text-red-800/70">
          Permanently delete this product, its variants, and its images. This can&apos;t be undone.
        </p>
        <DeleteProductButton productId={product.id} productName={product.name} variant="full" />
      </section>
    </div>
  );
}
