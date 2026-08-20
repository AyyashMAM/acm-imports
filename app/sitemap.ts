import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts();

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: new URL(`/products/${product.id}`, SITE_URL).toString(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))
  );
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: new URL(`/products?category=${encodeURIComponent(category)}`, SITE_URL).toString(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL.toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/products", SITE_URL).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryEntries,
    ...productEntries,
  ];
}
