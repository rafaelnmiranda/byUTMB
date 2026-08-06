import type { Metadata } from "next";

import { PageHeader, UpdatedAt } from "@/components/PageHeader";
import { ScheduleBrowser } from "@/components/ScheduleBrowser";
import { formatDateRange, formatUpdatedAt } from "@/lib/format";
import { EVENT_TIMEZONE, getSchedule } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Programação",
  description: "Todos os eventos do Paraty Brazil by UTMB, dia a dia.",
};

export default async function SchedulePage() {
  const { events, days, fetchedAt } = await getSchedule();

  if (days.length === 0) {
    return (
      <main className="flex flex-1 flex-col">
        <PageHeader title="Programação" />
        <p className="mx-4 rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border-subtle">
          A programação da próxima edição ainda não foi publicada.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Programação" subtitle={formatDateRange(days.map((day) => day.key))} />

      <div className="px-4">
        <ScheduleBrowser events={events} days={days} initialDay={pickInitialDay(days)} />
      </div>

      <div className="mt-auto pt-6">
        <UpdatedAt time={formatUpdatedAt(fetchedAt)} />
      </div>
    </main>
  );
}

/** Durante o evento, abre no dia de hoje. Fora dele, no primeiro dia. */
function pickInitialDay(days: { key: string }[]): string {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return days.find((day) => day.key === today)?.key ?? days[0].key;
}
