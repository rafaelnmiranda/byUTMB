"use client";

import { useMemo, useState } from "react";

import { EVENT_TYPES, EVENT_TYPE_STYLES } from "@/lib/event-type";
import { formatDayShort } from "@/lib/format";
import type { EventDay, EventItem, EventType } from "@/lib/schedule";

import { EventCard } from "./EventCard";
import { EventTypeIcon } from "./icons";

interface Props {
  events: EventItem[];
  days: EventDay[];
  /** Dia aberto ao entrar: o dia de hoje, se o evento estiver rolando. */
  initialDay: string;
}

export function ScheduleBrowser({ events, days, initialDay }: Props) {
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [activeTypes, setActiveTypes] = useState<Set<EventType>>(new Set(EVENT_TYPES));

  const visible = useMemo(
    () => events.filter((event) => event.dayKey === selectedDay && activeTypes.has(event.type)),
    [events, selectedDay, activeTypes],
  );

  const toggleType = (type: EventType) => {
    setActiveTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        // Nunca deixa o filtro zerar — uma lista vazia por acidente confunde.
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Seletor de dias — derivado da planilha, sem datas fixas no código */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div role="tablist" aria-label="Dia do evento" className="flex gap-2">
          {days.map((day) => {
            const active = day.key === selectedDay;

            return (
              <button
                key={day.key}
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedDay(day.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-utmb-blue text-white dark:bg-utmb-yellow dark:text-utmb-blue"
                    : "bg-surface text-muted ring-1 ring-border-subtle"
                }`}
              >
                {formatDayShort(day.key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro por tipo */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {EVENT_TYPES.map((type) => {
            const style = EVENT_TYPE_STYLES[type];
            const active = activeTypes.has(type);

            return (
              <button
                key={type}
                aria-pressed={active}
                onClick={() => toggleType(type)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? style.chipActive : `${style.chip} ${style.text} opacity-60`
                }`}
              >
                <EventTypeIcon type={type} className="h-3.5 w-3.5" />
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border-subtle">
          Nenhum evento com esses filtros neste dia.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((event) => (
            <li key={event.slug}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
