import { parseCSVToObjects } from "./csv";
import {
  DEFAULT_BENEFIT_VALID_FROM,
  DEFAULT_BENEFIT_VALID_TO,
  defaultConditions,
} from "./redeem";
import { slugify } from "./schedule";

export type PartnerCategory = "food" | "running" | "outros";

export interface Partner {
  slug: string;
  name: string;
  description: string;
  /** Lista de benefícios (coluna `benefits`, separada por `;`). */
  benefits: string[];
  /** Condições exibidas na ativação (coluna `conditions`). */
  conditions: string;
  /** Início da validade (`YYYY-MM-DD`, coluna `validFrom`). */
  validFrom: string;
  /** Fim da validade inclusivo (`YYYY-MM-DD`, coluna `validTo`). */
  validTo: string;
  /**
   * Se o parceiro participa do resgate por QR.
   * Desligado quando `redeem=nao` ou não há benefício listado.
   */
  redeemEnabled: boolean;
  /** @deprecated Cupom verbal — mantido no parse só para planilhas antigas. */
  promoCode: string | null;
  website: string | null;
  mapsUrl: string | null;
  category: PartnerCategory;
  /** URL absoluta ou nome de asset — ver `resolvePartnerImage`. */
  logo: string | null;
  cover: string | null;
  /** Preenchido em `getPartners()` — caminho público ou URL. */
  logoUrl: string | null;
  coverUrl: string | null;
}

export interface PartnerCatalog {
  partners: Partner[];
  fetchedAt: string;
  skipped: number;
}

/** Recorte público para a tela de ativação / cache offline. */
export interface RedeemablePartner {
  slug: string;
  name: string;
  benefits: string[];
  conditions: string;
  validFrom: string;
  validTo: string;
  redeemEnabled: boolean;
  category: PartnerCategory;
  logoUrl: string | null;
}

export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, string> = {
  food: "Restaurante",
  running: "Expo",
  outros: "Parceiro",
};

/** gid da aba `parceiros` em https://docs.google.com/spreadsheets/d/1Tn6sLvxj5kEQD9l8hZb9BP8dxz1sQzKp */
export const PARTNERS_SHEET_GID = "1344926349";

const CATEGORY_ALIASES: Record<string, PartnerCategory> = {
  food: "food",
  restaurante: "food",
  restaurant: "food",
  running: "running",
  corrida: "running",
  esporte: "running",
  expo: "running",
};

export function resolvePartnersCsvUrl(): string | null {
  const explicit = process.env.PARTNERS_CSV_URL?.trim();
  if (explicit) return explicit;

  const schedule = process.env.SCHEDULE_CSV_URL?.trim();
  if (!schedule) return null;

  const sheetId = schedule.match(/\/spreadsheets\/d\/([^/]+)/)?.[1];
  if (!sheetId) return null;

  // Aba `parceiros` da planilha de produção (programacao2026.xlsx).
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${PARTNERS_SHEET_GID}`;
}

/**
 * Monta o catálogo a partir de CSV. Para buscar na planilha ao vivo, use
 * `getPartners()` em `partners.server.ts`.
 */
export function buildPartners(csv: string): PartnerCatalog {
  const rows = parseCSVToObjects(csv);
  const partners: Partner[] = [];
  const usedSlugs = new Set<string>();
  let skipped = 0;

  for (const row of rows) {
    const partner = toPartner(row, usedSlugs);
    if (partner) {
      partners.push(partner);
      usedSlugs.add(partner.slug);
    } else {
      skipped += 1;
    }
  }

  partners.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return { partners, fetchedAt: new Date().toISOString(), skipped };
}

export function toRedeemablePartner(partner: Partner): RedeemablePartner {
  return {
    slug: partner.slug,
    name: partner.name,
    benefits: partner.benefits,
    conditions: partner.conditions,
    validFrom: partner.validFrom,
    validTo: partner.validTo,
    redeemEnabled: partner.redeemEnabled,
    category: partner.category,
    logoUrl: partner.logoUrl,
  };
}

function toPartner(row: Record<string, string>, usedSlugs: Set<string>): Partner | null {
  const name = row["name"]?.trim();
  if (!name) return null;

  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  const benefits = (row["benefits"] ?? "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  const conditions = row["conditions"]?.trim() || defaultConditions();
  const validFrom = parseDay(row["validfrom"]) ?? envOrDefaultFrom();
  const validTo = parseDay(row["validto"]) ?? envOrDefaultTo();
  const redeemFlag = parseBool(row["redeem"]);
  const redeemEnabled = redeemFlag !== false && benefits.length > 0;

  return {
    slug,
    name,
    description: row["description"]?.trim() ?? "",
    benefits,
    conditions,
    validFrom,
    validTo,
    redeemEnabled,
    promoCode: row["promocode"]?.trim() || null,
    website: row["website"]?.trim() || null,
    mapsUrl: row["location"]?.trim() || null,
    category: parseCategory(row["category"]),
    logo: row["logo"]?.trim() || null,
    cover: row["partner_cover"]?.trim() || null,
    logoUrl: null,
    coverUrl: null,
  };
}

function envOrDefaultFrom(): string {
  return process.env.BENEFIT_VALID_FROM?.trim() || DEFAULT_BENEFIT_VALID_FROM;
}

function envOrDefaultTo(): string {
  return process.env.BENEFIT_VALID_TO?.trim() || DEFAULT_BENEFIT_VALID_TO;
}

/** Aceita `2026-09-17` ou `17/09/2026`. */
function parseDay(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const br = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  }

  return null;
}

function parseBool(raw: string | undefined): boolean | null {
  if (raw === undefined || raw.trim() === "") return null;
  const key = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (["sim", "yes", "true", "1", "s"].includes(key)) return true;
  if (["nao", "no", "false", "0", "n"].includes(key)) return false;
  return null;
}

function parseCategory(raw: string | undefined): PartnerCategory {
  const key = (raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return CATEGORY_ALIASES[key] ?? "outros";
}
