import Link from "next/link";

import { EVENT_TYPE_STYLES } from "@/lib/event-type";
import { formatTimeRange } from "@/lib/format";
import type { EventItem } from "@/lib/schedule";

import { ChevronIcon, EventTypeIcon, PinIcon } from "./icons";

export function EventCard({ event, badge }: { event: EventItem; badge?: string }) {
  const style = EVENT_TYPE_STYLES[event.type];

  return (
    <Link
      href={`/programacao/${event.slug}`}
      className="group relative flex items-stretch gap-3 overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border-subtle transition active:scale-[0.99]"
    >
      <span aria-hidden className={`w-1 shrink-0 ${style.bar}`} />

      <div className="flex min-w-0 flex-1 flex-col gap-1 py-3 pr-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {formatTimeRange(event.startsAt, event.endsAt)}
          </span>
          {badge && (
            <span className="rounded-full bg-utmb-yellow px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-utmb-blue">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-[15px] font-semibold leading-snug text-foreground">{event.title}</h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <PinIcon className="h-3.5 w-3.5" />
              {event.location}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 ${style.text}`}>
            <EventTypeIcon type={event.type} className="h-3.5 w-3.5" />
            {style.label}
          </span>
        </div>
      </div>

      <ChevronIcon className="mr-2 h-5 w-5 shrink-0 self-center text-muted/60 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
