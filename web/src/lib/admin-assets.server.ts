import "server-only";

import { resolveEventImageRef, resolvePartnerImageRef } from "./assets.server";
import type { AssetInventory, AssetSlot, AssetStatus } from "./admin-assets.types";
import { getPartners } from "./partners.server";
import { getSchedule } from "./schedule.server";

export type { AssetInventory, AssetKind, AssetSlot, AssetStatus } from "./admin-assets.types";

function partnerLogoPath(ref: string): string | null {
  const match = /^(.+)_logo$/i.exec(ref.trim());
  return match ? `images/partners/${match[1]}/logo` : null;
}

function partnerCoverPath(ref: string): string | null {
  const match = /^(.+)_cover$/i.exec(ref.trim());
  return match ? `images/partners/${match[1]}/cover` : null;
}

function slotStatus(ref: string, url: string | null): AssetStatus {
  if (/^https?:\/\//i.test(ref.trim())) return "external";
  return url ? "complete" : "missing";
}

export async function getAssetInventory(): Promise<AssetInventory> {
  const [{ partners }, { events }] = await Promise.all([getPartners(), getSchedule()]);
  const slots: AssetSlot[] = [];

  for (const partner of partners) {
    if (partner.logo?.trim()) {
      const ref = partner.logo.trim();
      const isExternal = /^https?:\/\//i.test(ref);
      const relativePath = isExternal ? "" : (partnerLogoPath(ref) ?? "");
      const url = resolvePartnerImageRef(partner.logo);

      if (!isExternal && relativePath) {
        slots.push({
          id: `partner-logo:${ref}`,
          kind: "partner-logo",
          ref,
          label: "Logo",
          group: partner.name,
          relativePath,
          url,
          status: slotStatus(ref, url),
        });
      } else if (isExternal) {
        slots.push({
          id: `partner-logo:${ref}`,
          kind: "partner-logo",
          ref,
          label: "Logo",
          group: partner.name,
          relativePath: "",
          url: ref,
          status: "external",
        });
      }
    }

    if (partner.cover?.trim()) {
      const ref = partner.cover.trim();
      const isExternal = /^https?:\/\//i.test(ref);
      const relativePath = isExternal ? "" : (partnerCoverPath(ref) ?? "");
      const url = resolvePartnerImageRef(partner.cover);

      if (!isExternal && relativePath) {
        slots.push({
          id: `partner-cover:${ref}`,
          kind: "partner-cover",
          ref,
          label: "Capa",
          group: partner.name,
          relativePath,
          url,
          status: slotStatus(ref, url),
        });
      } else if (isExternal) {
        slots.push({
          id: `partner-cover:${ref}`,
          kind: "partner-cover",
          ref,
          label: "Capa",
          group: partner.name,
          relativePath: "",
          url: ref,
          status: "external",
        });
      }
    }
  }

  for (const event of events) {
    if (!event.image?.trim()) continue;

    const ref = event.image.trim();
    const isExternal = /^https?:\/\//i.test(ref);
    const relativePath = isExternal ? "" : `images/events/${ref}`;
    const url = resolveEventImageRef(event.image);

    if (!isExternal && relativePath) {
      slots.push({
        id: `event:${event.slug}`,
        kind: "event",
        ref,
        label: event.title,
        group: "Programação",
        relativePath,
        url,
        status: slotStatus(ref, url),
      });
    } else if (isExternal) {
      slots.push({
        id: `event:${event.slug}`,
        kind: "event",
        ref,
        label: event.title,
        group: "Programação",
        relativePath: "",
        url: ref,
        status: "external",
      });
    }
  }

  slots.sort((a, b) => {
    const group = a.group.localeCompare(b.group, "pt-BR");
    if (group !== 0) return group;
    return a.label.localeCompare(b.label, "pt-BR");
  });

  const complete = slots.filter((s) => s.status === "complete").length;
  const missing = slots.filter((s) => s.status === "missing").length;
  const external = slots.filter((s) => s.status === "external").length;

  return {
    slots,
    summary: { total: slots.length, complete, missing, external },
    fetchedAt: new Date().toISOString(),
    uploadsEnabled: process.env.NODE_ENV === "development" || process.env.ADMIN_UPLOADS_ENABLED === "true",
  };
}
