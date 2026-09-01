import type { Metadata } from "next";
import { createProduct } from "../actions";
import { CategoryAttributeFields } from "@/components/admin/category-attribute-fields";
import { ProductImageInput } from "@/components/admin/product-image-input";
import { SubmitButton } from "@/components/admin/submit-button";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
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
        <CategoryAttributeFields />
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Starting price (LKR)</label>
          <input
            name="base_price"
            type="number"
            step="0.01"
            min="0"
            required
            className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Creates a default variant at this price — edit price, cost, and stock on the next screen.
          </p>
        </div>
        <SubmitButton
          pendingText="Creating..."
          className="mt-2 flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md active:scale-[0.98]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          Create product
        </SubmitButton>
      </form>
    </div>
  );
}
