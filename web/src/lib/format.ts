import { EVENT_TIMEZONE } from "./schedule";

/**
 * Tudo é formatado no fuso de Paraty, de propósito.
 *
 * Um atleta europeu com o celular no fuso de casa precisa ver "largada às 06:00",
 * não "11:00". O app iOS usava o fuso do aparelho e erraria isso.
 */
const LOCALE = "pt-BR";

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: EVENT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTimeRange(startIso: string, endIso: string | null): string {
  const start = formatTime(startIso);
  if (!endIso) return start;
  return `${start} – ${formatTime(endIso)}`;
}

/** Horário + duração opcional para a tela de detalhe. */
export function formatEventSchedule(
  startIso: string,
  endIso: string | null,
  durationSeconds: number | null,
): string {
  if (!endIso || durationSeconds === null) {
    return formatTime(startIso);
  }

  return `${formatTimeRange(startIso, endIso)} · ${formatDuration(durationSeconds)}`;
}

/**
 * Só a primeira letra em maiúscula.
 *
 * Feito aqui e não com `text-transform: capitalize`, que maiusculiza toda palavra
 * e produziria "Quinta-Feira, 18 De Setembro".
 */
export function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * "Qui 18" — rótulo do seletor de dias.
 *
 * Deliberadamente curto: com o mês junto, os 4 dias do evento não cabem lado a
 * lado numa tela de celular. O mês já aparece no subtítulo da página.
 */
export function formatDayShort(dayKey: string): string {
  const date = dayKeyToDate(dayKey);

  const weekday = new Intl.DateTimeFormat(LOCALE, {
    timeZone: EVENT_TIMEZONE,
    weekday: "short",
  })
    .format(date)
    .replace(/\.$/, "");

  const day = new Intl.DateTimeFormat(LOCALE, {
    timeZone: EVENT_TIMEZONE,
    day: "numeric",
  }).format(date);

  return `${capitalizeFirst(weekday)} ${day}`;
}

/** "Quinta-feira, 18 de setembro" — cabeçalho de seção. */
export function formatDayLong(dayKey: string): string {
  return capitalizeFirst(
    new Intl.DateTimeFormat(LOCALE, {
      timeZone: EVENT_TIMEZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(dayKeyToDate(dayKey)),
  );
}

/** "18 a 21 de setembro de 2025" — subtítulo, derivado dos dados e não fixo no código. */
export function formatDateRange(dayKeys: string[]): string {
  if (dayKeys.length === 0) return "";

  const first = dayKeyToDate(dayKeys[0]);
  const last = dayKeyToDate(dayKeys[dayKeys.length - 1]);

  const dayOf = (date: Date) =>
    new Intl.DateTimeFormat(LOCALE, { timeZone: EVENT_TIMEZONE, day: "numeric" }).format(date);
  const monthYearOf = (date: Date) =>
    new Intl.DateTimeFormat(LOCALE, {
      timeZone: EVENT_TIMEZONE,
      month: "long",
      year: "numeric",
    }).format(date);

  if (dayKeys.length === 1) return `${dayOf(first)} de ${monthYearOf(first)}`;

  const sameMonth = dayKeys[0].slice(0, 7) === dayKeys[dayKeys.length - 1].slice(0, 7);

  return sameMonth
    ? `${dayOf(first)} a ${dayOf(last)} de ${monthYearOf(last)}`
    : `${dayOf(first)} de ${monthYearOf(first)} a ${dayOf(last)} de ${monthYearOf(last)}`;
}

/** Carimbo de "atualizado às", para o atleta saber se o dado é fresco ou de cache. */
export function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: EVENT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return hours === 1 ? "1 hora" : `${hours} horas`;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

/** "em 25 min", "em 2h10", "agora" — contagem relativa usada na home. */
export function formatRelative(fromIso: string, now: number): string {
  const diffMinutes = Math.round((new Date(fromIso).getTime() - now) / 60000);

  if (diffMinutes <= 0) return "agora";
  if (diffMinutes < 60) return `em ${diffMinutes} min`;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (hours < 24) return minutes === 0 ? `em ${hours}h` : `em ${hours}h${String(minutes).padStart(2, "0")}`;

  const days = Math.round(hours / 24);
  return days === 1 ? "amanhã" : `em ${days} dias`;
}

function dayKeyToDate(dayKey: string): Date {
  // Meio-dia UTC evita que o dia "escorregue" na conversão de fuso.
  return new Date(`${dayKey}T12:00:00Z`);
}
