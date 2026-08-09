import "server-only";

import { resolvePartnerImageRef } from "./assets.server";
import { buildPartners, resolvePartnersCsvUrl, type PartnerCatalog } from "./partners";

const REVALIDATE_SECONDS = 300;

/** Busca parceiros na planilha e resolve logos/capas locais. */
export async function getPartners(): Promise<PartnerCatalog> {
  const url = resolvePartnersCsvUrl();

  if (!url) {
    return { partners: [], fetchedAt: new Date().toISOString(), skipped: 0 };
  }

  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["partners"] },
  });

  if (!response.ok) {
    console.error(`Falha ao carregar parceiros (HTTP ${response.status})`);
    return { partners: [], fetchedAt: new Date().toISOString(), skipped: 0 };
  }

  const catalog = buildPartners(await response.text());

  return {
    ...catalog,
    partners: catalog.partners.map((partner) => ({
      ...partner,
      logoUrl: resolvePartnerImageRef(partner.logo),
      coverUrl: resolvePartnerImageRef(partner.cover),
    })),
  };
}
