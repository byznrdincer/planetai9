import type { MetadataRoute } from "next";

const SITE = process.env.PLANETAI_SITE_URL ?? "https://planetai9.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
