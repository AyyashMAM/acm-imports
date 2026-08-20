import Link from "next/link";
import { getOrders } from "@/lib/admin/orders-data";
import { getAllProducts } from "@/lib/admin/products-data";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  const [pendingOrders, products] = await Promise.all([
    getOrders("pending"),
    getAllProducts(),
  ]);

  const lowStockVariants = products.flatMap((product) =>
    product.product_variants
      .filter((v) => v.is_active && v.stock_quantity <= LOW_STOCK_THRESHOLD)
      .map((v) => ({ product, variant: v }))
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/orders?status=pending"
          prefetch={false}
          className="rounded-2xl border border-black/10 bg-white p-6 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-zinc-500">Pending orders</p>
          <p className="mt-1 text-3xl font-extrabold text-brand">
            {pendingOrders.length}
          </p>
        </Link>
        <Link
          href="/admin/products"
          prefetch={false}
          className="rounded-2xl border border-black/10 bg-white p-6 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-zinc-500">Active products</p>
          <p className="mt-1 text-3xl font-extrabold">
            {products.filter((p) => p.is_active).length}
          </p>
        </Link>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Low stock (5 or fewer)</h2>
        {lowStockVariants.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing low on stock.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {lowStockVariants.map(({ product, variant }) => (
              <li key={variant.id} className="flex items-center justify-between">
                <Link
                  href={`/admin/products/${product.id}`}
                  prefetch={false}
                  className="hover:text-brand"
                >
                  {product.name} — {variant.label}
                </Link>
                <span className="font-semibold text-red-600">
                  {variant.stock_quantity} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
