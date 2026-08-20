import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/admin/products-data";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Products</h1>
        <Link
          href="/admin/products/new"
          prefetch={false}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          + New product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Total stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.product_variants.reduce(
                (sum, v) => sum + v.stock_quantity,
                0
              );
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
                  <td className="px-4 py-3">{product.product_variants.length}</td>
                  <td className="px-4 py-3">{totalStock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
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
