import { EVENT_TIMEZONE } from "./schedule";
import type { Partner } from "./partners";

/** Duração da comprovação viva após o atleta confirmar. */
export const REDEEM_WINDOW_MS = 3 * 60 * 1000;

/** Datas padrão do evento 2026 (Paraty), se a planilha não informar. */
export const DEFAULT_BENEFIT_VALID_FROM = "2026-09-17";
export const DEFAULT_BENEFIT_VALID_TO = "2026-09-20";

const CONDITIONS_PADRAO =
  "Válido só no estabelecimento, na hora da conta. Não cumulativo com outras promoções. Sujeito a disponibilidade.";

export function defaultConditions(): string {
  return CONDITIONS_PADRAO;
}

/** Dia civil em Paraty (`YYYY-MM-DD`). */
export function paratyDayKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export type RedeemAvailability =
  | { ok: true }
  | { ok: false; reason: "before" | "after" | "inactive" };

export function checkRedeemAvailability(
  partner: Pick<Partner, "validFrom" | "validTo" | "redeemEnabled">,
  now: Date = new Date(),
): RedeemAvailability {
  if (!partner.redeemEnabled) return { ok: false, reason: "inactive" };

  const day = paratyDayKey(now);
  if (day < partner.validFrom) return { ok: false, reason: "before" };
  if (day > partner.validTo) return { ok: false, reason: "after" };
  return { ok: true };
}

export function primaryBenefit(partner: Pick<Partner, "benefits">): string | null {
  return partner.benefits[0] ?? null;
}

/**
 * Código visual que muda a cada segundo — prova “ao vivo” para o garçom.
 * Hash leve (sem Node crypto) para rodar no browser.
 */
export function liveProofCode(slug: string, nowMs: number): string {
  const bucket = Math.floor(nowMs / 1000);
  let h = 2166136261;
  const input = `${slug}:${bucket}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return String(h >>> 0).padStart(6, "0").slice(-6);
}

export function formatParatyClock(nowMs: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: EVENT_TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(nowMs));
}

export function formatCountdown(remainingMs: number): string {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
