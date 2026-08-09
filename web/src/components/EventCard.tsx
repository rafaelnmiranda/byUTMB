import Link from "next/link";

import { EVENT_TYPE_STYLES } from "@/lib/event-type";
import { formatTimeRange } from "@/lib/format";
import type { EventItem } from "@/lib/schedule";

import { EventImage } from "./EventImage";
import { ChevronIcon, EventTypeIcon, PinIcon } from "./icons";

export function EventCard({ event, badge }: { event: EventItem; badge?: string }) {
  const style = EVENT_TYPE_STYLES[event.type];

  return (
    <Link
      href={`/programacao/${event.slug}`}
      className="group relative flex min-h-24 overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border-subtle transition active:scale-[0.99]"
    >
      <EventImage event={event} variant="thumbnail" className="self-center rounded-r-lg" />
      <span aria-hidden className={`w-1 shrink-0 ${style.bar}`} />

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-base font-extrabold leading-none tabular-nums text-utmb-navy dark:text-utmb-yellow">
            {formatTimeRange(event.startsAt, event.endsAt)}
          </span>
          {badge && (
            <span className="rounded-full bg-utmb-yellow px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-utmb-navy">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold leading-tight tracking-[-0.01em] text-foreground">
          {event.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] leading-tight text-muted">
          {event.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <PinIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
          <span className={`inline-flex items-center gap-1 ${style.text}`}>
            <EventTypeIcon type={event.type} className="h-3 w-3" />
            {style.label}
          </span>
        </div>
      </div>

      <ChevronIcon className="mr-2 h-5 w-5 shrink-0 self-center text-muted/60 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
