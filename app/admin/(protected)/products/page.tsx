import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/admin/products-data";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { computeMargin } from "@/lib/currency";
import type { AdminProduct } from "@/lib/admin/types";

const STATUS_STYLES: Record<AdminProduct["status"], string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-zinc-200 text-zinc-600",
};

function averageMarginPercent(product: AdminProduct): number | null {
  const margins = product.product_variants
    .map((v) => computeMargin(v.price, v.cost_price))
    .filter((m): m is NonNullable<typeof m> => m !== null);
  if (margins.length === 0) return null;
  return margins.reduce((sum, m) => sum + m.percent, 0) / margins.length;
}

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-900">Products</h1>
        <Link
          href="/admin/products/new"
          prefetch={false}
          className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          New product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/10 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Total stock</th>
              <th className="px-4 py-3">Margin</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.product_variants.reduce(
                (sum, v) => sum + v.stock_quantity,
                0
              );
              const margin = averageMarginPercent(product);
              return (
                <tr
                  key={product.id}
                  className="border-b border-black/5 last:border-0 hover:bg-zinc-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      prefetch={false}
                      className="font-semibold hover:text-brand"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {product.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono">{product.product_variants.length}</td>
                  <td className="px-4 py-3 font-mono">{totalStock}</td>
                  <td className="px-4 py-3 font-mono">
                    {margin === null ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      <span className={`font-semibold ${margin < 0 ? "text-red-600" : "text-zinc-700"}`}>
                        {margin.toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[product.status]}`}>
                      {product.status[0].toUpperCase() + product.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        prefetch={false}
                        aria-label={`Edit ${product.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-black/[.04] hover:text-zinc-900"
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M11.5 2.5 13.5 4.5 5 13H3v-2L11.5 2.5Z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No products yet.
          </p>
        )}
      </div>
    </div>
  );
}
