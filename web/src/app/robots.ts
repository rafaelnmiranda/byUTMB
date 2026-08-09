import type { MetadataRoute } from "next";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://byutmb.com.br").replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/p/", "/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
