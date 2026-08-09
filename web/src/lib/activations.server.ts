import "server-only";

import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { EVENT_TIMEZONE } from "./schedule";

export interface ActivationEvent {
  partnerSlug: string;
  partnerName: string;
  at: string;
}

export interface ActivationAggregateRow {
  partnerSlug: string;
  partnerName: string;
  total: number;
  byDay: Record<string, number>;
  byHour: Record<string, number>;
}

const memory: ActivationEvent[] = [];
const MAX_MEMORY = 5000;

function dataDir(): string {
  return join(process.cwd(), ".data");
}

function dataFile(): string {
  return join(dataDir(), "activations.jsonl");
}

function dayHourKeys(iso: string): { day: string; hour: string } {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: EVENT_TIMEZONE,
    hour: "2-digit",
    hour12: false,
  }).format(date);
  return { day, hour: `${day}T${hour}` };
}

async function persist(event: ActivationEvent): Promise<void> {
  try {
    await mkdir(dataDir(), { recursive: true });
    await appendFile(dataFile(), `${JSON.stringify(event)}\n`, "utf8");
  } catch {
    // Vercel / filesystem read-only — memória + webhook bastam.
  }

  const webhook = process.env.ACTIVATIONS_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch {
      // Não bloqueia o atleta se o webhook falhar.
    }
  }
}

export async function recordActivation(
  input: Omit<ActivationEvent, "at"> & { at?: string },
): Promise<ActivationEvent> {
  const event: ActivationEvent = {
    partnerSlug: input.partnerSlug,
    partnerName: input.partnerName,
    at: input.at ?? new Date().toISOString(),
  };

  memory.push(event);
  if (memory.length > MAX_MEMORY) memory.splice(0, memory.length - MAX_MEMORY);

  await persist(event);
  return event;
}

async function loadFromDisk(): Promise<ActivationEvent[]> {
  try {
    const raw = await readFile(dataFile(), "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ActivationEvent);
  } catch {
    return [];
  }
}

export async function listActivations(): Promise<ActivationEvent[]> {
  const disk = await loadFromDisk();
  const byKey = new Map<string, ActivationEvent>();
  for (const event of [...disk, ...memory]) {
    byKey.set(`${event.at}:${event.partnerSlug}`, event);
  }
  return [...byKey.values()].sort((a, b) => a.at.localeCompare(b.at));
}

export async function aggregateActivations(): Promise<ActivationAggregateRow[]> {
  const events = await listActivations();
  const map = new Map<string, ActivationAggregateRow>();

  for (const event of events) {
    let row = map.get(event.partnerSlug);
    if (!row) {
      row = {
        partnerSlug: event.partnerSlug,
        partnerName: event.partnerName,
        total: 0,
        byDay: {},
        byHour: {},
      };
      map.set(event.partnerSlug, row);
    }
    row.total += 1;
    const { day, hour } = dayHourKeys(event.at);
    row.byDay[day] = (row.byDay[day] ?? 0) + 1;
    row.byHour[hour] = (row.byHour[hour] ?? 0) + 1;
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}
