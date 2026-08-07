import Link from "next/link";

import { Logo } from "@/components/Logo";
import { NowNext } from "@/components/NowNext";
import { UpdatedAt } from "@/components/PageHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CalendarIcon, CloudSunIcon, InfoIcon } from "@/components/icons";
import { formatDateRange, formatUpdatedAt } from "@/lib/format";
import { getSchedule } from "@/lib/schedule";

export default async function HomePage() {
  const { events, days, fetchedAt } = await getSchedule();
  const dateRange = formatDateRange(days.map((day) => day.key));

  return (
    <main className="flex flex-1 flex-col">
      {/* Capa: navy da marca com brilho teal e régua amarela */}
      <header className="relative overflow-hidden bg-utmb-navy-deep px-4 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-utmb-teal/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-utmb-navy-soft/40 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <Logo className="h-11" onNavy />
            <ThemeToggle tone="dark" />
          </div>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-utmb-yellow">
            Paraty · Rio de Janeiro
          </p>

          {dateRange && (
            <p className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">{dateRange}</p>
          )}

          <span aria-hidden className="mt-4 block h-1 w-12 rounded-full bg-utmb-yellow" />
        </div>
      </header>

      <div className="-mt-4 flex flex-col gap-6 rounded-t-2xl bg-background px-4 pb-2 pt-6">
        <NowNext events={events} />

        <nav className="grid grid-cols-3 gap-2">
          <Shortcut href="/programacao" label="Programação" Icon={CalendarIcon} />
          <Shortcut href="/previsao" label="Previsão" Icon={CloudSunIcon} />
          <Shortcut href="/informacoes" label="Informações" Icon={InfoIcon} />
        </nav>
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
