import { parseCSVToObjects } from "./csv";

export const EVENT_TIMEZONE = "America/Sao_Paulo";

/** Quanto tempo (em segundos) o servidor guarda a planilha antes de buscar de novo. */
const REVALIDATE_SECONDS = 300;

/** Duração padrão quando a planilha não informa (1 h). */
const DEFAULT_DURATION_SECONDS = 3600;

export type EventType = "esporte" | "entretenimento" | "ativacao";

export interface EventItem {
  slug: string;
  title: string;
  description: string;
  /** Instante de início em ISO/UTC. */
  startsAt: string;
  /** Instante de término em ISO/UTC. */
  endsAt: string;
  durationSeconds: number;
  location: string;
  type: EventType;
  /** Nome de asset local ou URL absoluta. `null` quando a planilha não informa. */
  image: string | null;
  link: string | null;
  featured: boolean;
  /** Dia do evento no fuso de Paraty, formato `YYYY-MM-DD`. Usado para agrupar. */
  dayKey: string;
}

export interface EventDay {
  key: string;
  /** Meia-noite daquele dia em Paraty, como instante UTC. */
  date: string;
  count: number;
}

export interface Schedule {
  events: EventItem[];
  days: EventDay[];
  /** Quando o servidor leu a planilha. */
  fetchedAt: string;
  /** Linhas que o parser não conseguiu interpretar — exibidas em /api/health. */
  skipped: number;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  esporte: "Esporte",
  entretenimento: "Entretenimento",
  ativacao: "Ativação",
};

/**
 * Busca a programação na planilha publicada do Google Sheets.
 *
 * O celular do atleta nunca fala com o Google: o CSV é lido e interpretado aqui,
 * no servidor, e o navegador recebe HTML pronto.
 */
export async function getSchedule(): Promise<Schedule> {
  const url = process.env.SCHEDULE_CSV_URL;

  if (!url) {
    // Sem configuração, a página ainda renderiza (vazia) em vez de estourar erro 500.
    return { events: [], days: [], fetchedAt: new Date().toISOString(), skipped: 0 };
  }

  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["schedule"] },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar a programação (HTTP ${response.status})`);
  }

  return buildSchedule(await response.text());
}

/** Separado de `getSchedule` para poder ser testado sem rede. */
export function buildSchedule(csv: string): Schedule {
  const rows = parseCSVToObjects(csv);
  const events: EventItem[] = [];
  const usedSlugs = new Set<string>();
  let skipped = 0;

  for (const row of rows) {
    const event = toEvent(row, usedSlugs);
    if (event) {
      events.push(event);
      usedSlugs.add(event.slug);
    } else {
      // Uma linha malformada nunca derruba a página inteira — é descartada.
      skipped += 1;
    }
  }

  events.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title));

  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.dayKey, (counts.get(event.dayKey) ?? 0) + 1);
  }

  const days: EventDay[] = [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => ({
      key,
      date: zonedWallTimeToUTC(key, "00:00").toISOString(),
      count,
    }));

  return { events, days, fetchedAt: new Date().toISOString(), skipped };
}

function toEvent(row: Record<string, string>, usedSlugs: Set<string>): EventItem | null {
  const date = row["data"];
  const time = row["hora"];
  const title = row["titulo"];

  if (!date || !time || !title) return null;

  const dayKey = normalizeDate(date);
  const hhmm = normalizeTime(time);
  if (!dayKey || !hhmm) return null;

  const start = zonedWallTimeToUTC(dayKey, hhmm);
  if (Number.isNaN(start.getTime())) return null;

  const durationSeconds = parseDuration(row["duracao"]);
  const end = new Date(start.getTime() + durationSeconds * 1000);

  return {
    slug: uniqueSlug(`${slugify(title)}-${dayKey.slice(5).replace("-", "")}${hhmm.replace(":", "")}`, usedSlugs),
    title,
    description: row["descricao"] ?? "",
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    durationSeconds,
    location: row["local"] ?? "",
    type: parseType(row["tipo"]),
    image: row["imagem"] || null,
    link: row["link"] || null,
    featured: /^(sim|yes|true|x|1)$/i.test(row["destaque"] ?? ""),
    dayKey,
  };
}

/** Aceita `2025-09-18` e também `18/09/2025`, que é o que o Sheets gera em pt-BR. */
function normalizeDate(raw: string): string | null {
  const value = raw.trim();

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
  if (iso) return `${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`;

  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (br) return `${br[3]}-${pad(br[2])}-${pad(br[1])}`;

  return null;
}

/** Aceita `7:30`, `07:30` e `07:30:00`. O app iOS tropeçava nas horas de um dígito. */
function normalizeTime(raw: string): string | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(raw.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return `${pad(hours)}:${pad(minutes)}`;
}

function parseDuration(raw: string | undefined): number {
  const value = Number((raw ?? "").trim());
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DURATION_SECONDS;
}

function parseType(raw: string | undefined): EventType {
  const value = (raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (value === "esporte") return "esporte";
  if (value === "ativacao") return "ativacao";
  return "entretenimento";
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function uniqueSlug(base: string, used: Set<string>): string {
  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function pad(value: string | number): string {
  return String(value).padStart(2, "0");
}

/**
 * Converte uma hora de parede em Paraty para o instante UTC correspondente.
 *
 * Não dá para usar `new Date("2025-09-18T10:00")` porque isso seria interpretado no
 * fuso do servidor (UTC na Vercel), adiantando os eventos em 3 h. Aqui o deslocamento
 * é medido com `Intl`, então continua correto mesmo que o Brasil volte a ter horário
 * de verão.
 */
export function zonedWallTimeToUTC(dayKey: string, hhmm: string): Date {
  const [year, month, day] = dayKey.split("-").map(Number);
  const [hour, minute] = hhmm.split(":").map(Number);

  const naive = Date.UTC(year, month - 1, day, hour, minute);

  // Duas passadas: a primeira estima o deslocamento, a segunda corrige a estimativa
  // nas raras viradas de horário de verão.
  let timestamp = naive - offsetAt(naive);
  timestamp = naive - offsetAt(timestamp);

  return new Date(timestamp);
}

/** Deslocamento do fuso do evento, em milissegundos, num dado instante. */
function offsetAt(timestamp: number): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts: Record<string, number> = {};
  for (const part of formatter.formatToParts(new Date(timestamp))) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }

  const asUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUTC - timestamp;
}
