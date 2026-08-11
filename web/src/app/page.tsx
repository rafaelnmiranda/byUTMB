import { BrandBar } from "@/components/BrandBar";
import { HomeHighlights } from "@/components/HomeHighlights";
import { HomeWelcome } from "@/components/HomeWelcome";
import { NowNext } from "@/components/NowNext";
import { UpdatedAt } from "@/components/PageHeader";
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
        <HomeHighlights />

        <NowNext events={events} />
      </div>

      <div className="mt-auto pt-4">
        <UpdatedAt time={formatUpdatedAt(fetchedAt)} />
      </div>
    </main>
  );
}
