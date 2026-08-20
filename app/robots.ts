import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/order-confirmation", "/admin"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
