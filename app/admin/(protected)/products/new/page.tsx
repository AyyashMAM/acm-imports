import type { Metadata } from "next";
import Link from "next/link";
import { createProduct } from "../actions";
import { CategoryAttributeFields } from "@/components/admin/category-attribute-fields";
import { ProductImageInput } from "@/components/admin/product-image-input";
import { SubmitButton } from "@/components/admin/submit-button";
import { SalePriceField } from "@/components/admin/sale-price-field";
import { getDistinctBrands } from "@/lib/admin/products-data";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const brands = await getDistinctBrands();

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">New product</h1>
      <form action={createProduct} className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6">
        <ProductImageInput />
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            name="name"
            required
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">SKU</label>
          <input
            name="sku"
            placeholder="Product-level SKU"
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <CategoryAttributeFields />
        <div>
          <label className="mb-1 block text-sm font-medium">Brand</label>
          <input
            name="brand"
            list="brand-options"
            placeholder="e.g. La Roche-Posay"
            autoComplete="off"
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          />
          <datalist id="brand-options">
            {brands.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-zinc-500">
            Pick an existing brand from the list, or type a new one.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Price (LKR)</label>
            <input
              name="base_price"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Weight</label>
            <div className="flex gap-2">
              <input
                name="weight_value"
                type="number"
                step="any"
                min="0.001"
                required
                className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
              />
              <select
                name="weight_unit"
                defaultValue="g"
                className="rounded-md border border-black/15 bg-transparent px-2 py-2 text-sm"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>
        </div>
        <p className="-mt-2 text-xs text-zinc-500">
          Creates a default variant at this price — edit price, cost, and stock on the next screen.
          Weight sets the courier charge at checkout: Rs 425 for the first kg, +Rs 100 per
          additional kg.
        </p>
        <SalePriceField defaultIsOnSale={false} defaultSalePrice={null} />
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="cruelty_free" />
            Cruelty-free
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="vegan" />
            Vegan
          </label>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue="draft"
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Starts as Draft so you can finish setting it up — switch to Published when it&apos;s ready to go live.
          </p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <SubmitButton
            pendingText="Creating..."
            className="flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Create product
          </SubmitButton>
          <Link
            href="/admin/products"
            prefetch={false}
            className="rounded-full border border-black/15 px-6 py-3 text-sm font-bold text-zinc-600 transition-colors hover:bg-black/[.04] hover:text-zinc-900"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
