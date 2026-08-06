import Link from "next/link";

import { NowNext } from "@/components/NowNext";
import { UpdatedAt } from "@/components/PageHeader";
import { CalendarIcon, CloudSunIcon, InfoIcon } from "@/components/icons";
import { formatDateRange, formatUpdatedAt } from "@/lib/format";
import { getSchedule } from "@/lib/schedule";

export default async function HomePage() {
  const { events, days, fetchedAt } = await getSchedule();
  const dateRange = formatDateRange(days.map((day) => day.key));

  return (
    <main className="flex flex-1 flex-col">
      <header className="bg-utmb-blue px-4 pb-6 pt-[max(2rem,env(safe-area-inset-top))] text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-utmb-yellow">
          Paraty · Rio de Janeiro
        </p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight">
          Paraty Brazil
          <span className="block text-utmb-yellow">by UTMB</span>
        </h1>
        {dateRange && <p className="mt-2 text-sm text-white/80">{dateRange}</p>}
      </header>

      <div className="flex flex-col gap-6 px-4 py-5">
        <NowNext events={events} />

        <nav className="grid grid-cols-3 gap-2">
          <Shortcut href="/programacao" label="Programação" Icon={CalendarIcon} />
          <Shortcut href="/previsao" label="Previsão" Icon={CloudSunIcon} />
          <Shortcut href="/informacoes" label="Informações" Icon={InfoIcon} />
        </nav>
      </div>

      <div className="mt-auto">
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
      <Icon className="h-6 w-6 text-utmb-blue dark:text-utmb-yellow" />
      {label}
    </Link>
  );
}
