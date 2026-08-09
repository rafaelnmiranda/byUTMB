import type { Metadata } from "next";

import { PageHeader, UpdatedAt } from "@/components/PageHeader";
import { WeatherGlyph } from "@/components/WeatherIcons";
import { WifiOffIcon } from "@/components/icons";
import { capitalizeFirst, formatDayShort, formatUpdatedAt } from "@/lib/format";
import { getWeather } from "@/lib/weather";

export const metadata: Metadata = {
  title: "Previsão do tempo",
  description: "Previsão do tempo em Paraty para os dias do evento.",
};

export default async function WeatherPage() {
  let data;

  try {
    data = await getWeather();
  } catch {
    return (
      <main className="flex flex-1 flex-col">
        <PageHeader title="Previsão do tempo" subtitle="Paraty, RJ" />
        <div className="mx-4 flex flex-col items-center gap-3 rounded-xl bg-surface px-4 py-10 text-center ring-1 ring-border-subtle">
          <WifiOffIcon className="h-10 w-10 text-muted" />
          <p className="text-sm font-semibold text-foreground">
            Não foi possível carregar a previsão
          </p>
          <p className="max-w-xs text-sm text-muted">
            Tente novamente em instantes. O restante do app continua funcionando normalmente.
          </p>
        </div>
      </main>
    );
  }

  const { current, forecast, fetchedAt } = data;

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Previsão do tempo" subtitle={`${current.city}, RJ`} />

      <div className="flex flex-col gap-4 px-4">
        <section className="flex flex-col items-center gap-3 rounded-xl bg-surface px-4 py-6 ring-1 ring-border-subtle">
          <WeatherGlyph icon={current.icon} className="h-16 w-16 text-utmb-navy dark:text-utmb-yellow" />

          <p className="text-5xl font-extrabold tabular-nums text-foreground">
            {Math.round(current.temp)}°
          </p>
          <p className="text-sm text-muted">{capitalizeFirst(current.description)}</p>

          <dl className="mt-2 grid w-full grid-cols-3 gap-2 text-center">
            <Stat label="Mín / Máx" value={`${Math.round(current.min)}° / ${Math.round(current.max)}°`} />
            <Stat label="Sensação" value={`${Math.round(current.feelsLike)}°`} />
            <Stat label="Umidade" value={`${current.humidity}%`} />
          </dl>
        </section>

        {forecast.length > 0 && (
          <section className="flex flex-col gap-1 rounded-xl bg-surface p-2 ring-1 ring-border-subtle">
            <h2 className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-muted">
              Próximos dias
            </h2>

            <ul>
              {forecast.map((day) => (
                <li
                  key={day.dayKey}
                  className="flex items-start gap-3 border-t border-border-subtle px-2 py-3 first:border-t-0"
                >
                  <span className="w-24 shrink-0 pt-0.5 text-sm font-semibold text-foreground">
                    {formatDayShort(day.dayKey)}
                  </span>
                  <WeatherGlyph icon={day.icon} className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-muted">{capitalizeFirst(day.description)}</p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-muted">
                      {day.humidity}% umid. · {day.windSpeedKmh} km/h vento
                    </p>
                  </div>
                  <span className="shrink-0 pt-0.5 text-sm tabular-nums">
                    <span className="text-muted">{Math.round(day.min)}°</span>
                    <span className="mx-1 text-muted/40">/</span>
                    <span className="font-semibold text-foreground">{Math.round(day.max)}°</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="mt-auto pt-6">
        <UpdatedAt time={formatUpdatedAt(fetchedAt)} />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
