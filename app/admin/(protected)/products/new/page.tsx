import type { Metadata } from "next";
import { createProduct } from "../actions";
import { CategoryAttributeFields } from "@/components/admin/category-attribute-fields";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">New product</h1>
      <form action={createProduct} className="flex flex-col gap-4">
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
        <button
          type="submit"
          className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark"
        >
          Create product
        </button>
      </form>
    </div>
  );
}
