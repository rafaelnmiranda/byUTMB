import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandBar } from "@/components/BrandBar";
import { EventImage } from "@/components/EventImage";
import { ShareButton } from "@/components/ShareButton";
import { CalendarPlusIcon, ClockIcon, EventTypeIcon, LinkIcon, PinIcon } from "@/components/icons";
import { EVENT_TYPE_STYLES } from "@/lib/event-type";
import { formatDayLong, formatEventSchedule, formatTimeRange } from "@/lib/format";
import { getSchedule } from "@/lib/schedule.server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { events } = await getSchedule();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { events } = await getSchedule();
  const event = events.find((item) => item.slug === slug);

  if (!event) return { title: "Evento não encontrado" };

  const when = `${formatDayLong(event.dayKey)}, ${formatTimeRange(event.startsAt, event.endsAt)}`;

  return {
    title: event.title,
    description: event.description || when,
    openGraph: { title: event.title, description: when },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const { events } = await getSchedule();
  const event = events.find((item) => item.slug === slug);

  if (!event) notFound();

  const style = EVENT_TYPE_STYLES[event.type];

  return (
    <main className="flex flex-1 flex-col">
      <BrandBar />

      <div className="relative z-10 -mt-2 overflow-hidden bg-background">
        <EventImage event={event} variant="hero" />

        <div className="px-4 pt-4">
          <Link
            href="/programacao"
            className="inline-flex items-center gap-1 py-2 text-sm font-semibold text-utmb-navy dark:text-utmb-yellow"
          >
            ← Programação
          </Link>
        </div>
      </div>

      <article className="flex flex-col gap-5 px-4 pb-8 pt-2">
        <header className="flex flex-col gap-3">
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${style.chip} ${style.text}`}
          >
            <EventTypeIcon type={event.type} className="h-3.5 w-3.5" />
            {style.label}
          </span>

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground">
            {event.title}
          </h1>
        </header>

        <dl className="flex flex-col gap-3 rounded-xl bg-surface p-4 ring-1 ring-border-subtle">
          <Row icon={<ClockIcon className="h-5 w-5" />} label="Quando">
            <span>{formatDayLong(event.dayKey)}</span>
            <br />
            {formatEventSchedule(event.startsAt, event.endsAt, event.durationSeconds)}
          </Row>

          {event.location && (
            <Row icon={<PinIcon className="h-5 w-5" />} label="Onde">
              {event.location}
            </Row>
          )}
        </dl>

        {event.description && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Sobre</h2>
            <p className="text-[15px] leading-relaxed text-foreground">{event.description}</p>
          </section>
        )}

        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/eventos/${event.slug}/ics`}
            className="inline-flex items-center gap-2 rounded-full bg-utmb-navy px-4 py-2.5 text-sm font-semibold text-white dark:bg-utmb-yellow dark:text-utmb-navy"
          >
            <CalendarPlusIcon className="h-4 w-4" />
            Adicionar à agenda
          </a>

          <ShareButton title={event.title} />

          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border-subtle"
            >
              <LinkIcon className="h-4 w-4" />
              Saiba mais
            </a>
          )}
        </div>
      </article>
    </main>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-muted">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
        <dd className="text-[15px] text-foreground">{children}</dd>
      </div>
    </div>
  );
}
