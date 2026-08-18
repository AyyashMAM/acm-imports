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
    ...productEntries,
  ];
}
