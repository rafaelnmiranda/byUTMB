import type { MetadataRoute } from "next";

import { getPartners } from "@/lib/partners.server";
import { getSchedule } from "@/lib/schedule.server";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://byutmb.com.br").replace(/\/$/, "");
}

const STATIC_PATHS = [
  "/",
  "/programacao",
  "/onde-comer",
  "/previsao",
  "/informacoes",
  "/mapa",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/programacao" ? "hourly" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  try {
    const [{ events }, { partners }] = await Promise.all([getSchedule(), getPartners()]);

    const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
      url: `${base}/programacao/${event.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    const partnerEntries: MetadataRoute.Sitemap = partners.map((partner) => ({
      url: `${base}/onde-comer/${partner.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticEntries, ...eventEntries, ...partnerEntries];
  } catch {
    return staticEntries;
  }
}
