import "server-only";

import { buildSchedule, type Schedule } from "./schedule";
import { resolveEventImageRef } from "./assets.server";

const REVALIDATE_SECONDS = 300;

/** Busca a programação na planilha e resolve URLs de imagem locais. */
export async function getSchedule(): Promise<Schedule> {
  const url = process.env.SCHEDULE_CSV_URL;

  if (!url) {
    return { events: [], days: [], fetchedAt: new Date().toISOString(), skipped: 0 };
  }

  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["schedule"] },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar a programação (HTTP ${response.status})`);
  }

  const schedule = buildSchedule(await response.text());

  return {
    ...schedule,
    events: schedule.events.map((event) => ({
      ...event,
      imageUrl: resolveEventImageRef(event.image),
    })),
  };
}
