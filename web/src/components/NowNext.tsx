"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

import { formatDayLong, formatRelative, formatTimeRange } from "@/lib/format";
import type { EventItem } from "@/lib/schedule";

import { EventCard } from "./EventCard";

/**
 * "Acontecendo agora" e "A seguir".
 *
 * Roda no cliente de propósito: a página é cacheada por alguns minutos, então
 * calcular "agora" no servidor devolveria um "agora" levemente velho. Aqui o
 * relógio é o do atleta e continua correto mesmo com a página servida do cache
 * offline.
 */
export function NowNext({ events }: { events: EventItem[] }) {
  const now = useNow();

  // Antes da hidratação não dá para saber que horas são no aparelho.
  if (now === null) {
    return <div className="h-40 animate-pulse rounded-xl bg-surface ring-1 ring-border-subtle" />;
  }

  const happening = events.filter(
    (event) => new Date(event.startsAt).getTime() <= now && new Date(event.endsAt).getTime() > now,
  );
  const upcoming = events
    .filter((event) => new Date(event.startsAt).getTime() > now)
    .slice(0, 4);

  if (happening.length === 0 && upcoming.length === 0) {
    return <EventOver events={events} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {happening.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-utmb-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-utmb-green" />
            </span>
            Acontecendo agora
          </SectionTitle>

          <ul className="flex flex-col gap-2">
            {happening.map((event) => (
              <li key={event.slug}>
                <EventCard event={event} badge="ao vivo" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>A seguir</SectionTitle>

          <ul className="flex flex-col gap-2">
            {upcoming.map((event) => (
              <li key={event.slug}>
                <EventCard event={event} badge={formatRelative(event.startsAt, now)} />
              </li>
            ))}
          </ul>

          <Link
            href="/programacao"
            className="mt-1 self-start text-sm font-semibold text-utmb-blue underline underline-offset-4 dark:text-utmb-yellow"
          >
            Ver programação completa
          </Link>
        </section>
      )}
    </div>
  );
}

/** Fora da temporada, a home não pode ficar vazia — mostra a próxima edição. */
function EventOver({ events }: { events: EventItem[] }) {
  const first = events[0];

  if (!first) {
    return (
      <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border-subtle">
        A programação da próxima edição ainda não foi publicada.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-surface p-5 text-center ring-1 ring-border-subtle">
      <p className="text-sm text-muted">A edição já foi encerrada. Até a próxima!</p>
      <p className="text-sm text-foreground">
        Primeiro evento programado:{" "}
        <strong>{formatDayLong(first.dayKey)}</strong>,{" "}
        {formatTimeRange(first.startsAt, first.endsAt)}
      </p>
      <Link
        href="/programacao"
        className="self-center text-sm font-semibold text-utmb-blue underline underline-offset-4 dark:text-utmb-yellow"
      >
        Ver programação completa
      </Link>
    </section>
  );
}

const TICK_MS = 30_000;

/**
 * O relógio do aparelho como fonte externa.
 *
 * `getSnapshot` precisa devolver o mesmo valor entre renders da mesma janela, senão
 * o React entra em laço — por isso o instante é arredondado para o tique de 30 s.
 * No servidor devolve `null`, o que faz a página renderizar o esqueleto e trocar
 * pelo conteúdo real logo após a hidratação.
 */
function useNow(): number | null {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const timer = setInterval(onStoreChange, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / TICK_MS) * TICK_MS,
    () => null,
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
      {children}
    </h2>
  );
}
