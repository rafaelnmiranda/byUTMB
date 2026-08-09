import Link from "next/link";

import { BrandBar } from "@/components/BrandBar";
import { HomeGuide } from "@/components/HomeGuide";
import { HomeWelcome } from "@/components/HomeWelcome";
import { NowNext } from "@/components/NowNext";
import { UpdatedAt } from "@/components/PageHeader";
import { CalendarIcon, CloudSunIcon, DollarIcon, MapIcon } from "@/components/icons";
import { formatDateRange, formatUpdatedAt } from "@/lib/format";
import { getSchedule } from "@/lib/schedule.server";

export default async function HomePage() {
  const { events, days, fetchedAt } = await getSchedule();
  const dateRange = formatDateRange(days.map((day) => day.key));

  return (
    <main className="flex flex-1 flex-col">
      <header className="bg-screen-gradient relative overflow-hidden text-utmb-navy dark:text-foreground">
        <BrandBar logoClassName="h-16 sm:h-20" className="pb-2" />
        <HomeWelcome events={events} now={Date.parse(fetchedAt)} />
        {dateRange && (
          <p className="relative px-4 pb-8 text-xs font-bold uppercase tracking-[0.14em] text-utmb-navy dark:text-utmb-yellow">
            {dateRange}
          </p>
        )}
      </header>

      <div className="-mt-4 flex flex-col gap-7 rounded-t-2xl bg-background px-4 pb-2 pt-6">
        <HomeGuide />

        <NowNext events={events} />

        <section aria-labelledby="atalhos-titulo">
          <h2
            id="atalhos-titulo"
            className="mb-2 text-xs font-bold uppercase tracking-wider text-muted"
          >
            Encontre rápido
          </h2>
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Atalhos">
            <Shortcut href="/programacao" label="Programação" Icon={CalendarIcon} />
            <Shortcut href="/onde-comer" label="Descontos em Paraty" Icon={DollarIcon} />
            <Shortcut href="/previsao" label="Previsão" Icon={CloudSunIcon} />
            <Shortcut href="/mapa" label="Mapa do evento" Icon={MapIcon} />
          </nav>
        </section>
      </div>

      <div className="mt-auto pt-4">
        <UpdatedAt time={formatUpdatedAt(fetchedAt)} />
      </div>
    </main>
  );
}

function Shortcut({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl bg-surface px-2 py-4 text-center text-xs font-semibold text-foreground shadow-sm ring-1 ring-border-subtle transition active:scale-[0.98]"
    >
      <Icon className="h-6 w-6 text-utmb-navy dark:text-utmb-yellow" />
      {label}
    </Link>
  );
}
