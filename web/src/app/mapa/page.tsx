import type { Metadata } from "next";

import { EventMapViewer } from "@/components/EventMapViewer";
import { PageHeader } from "@/components/PageHeader";
import { LinkIcon, PinIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mapa do evento",
  description:
    "Mapa da Arena, Expo e serviços do Paraty Brazil by UTMB 2026, com zoom e acesso offline.",
};

const ESSENTIAL_POINTS = [
  "Largada e chegada",
  "Posto médico",
  "Recovery e área VIP",
  "Dispersão e gift finisher",
  "Retirada de kits",
  "Credenciamento",
  "Loja oficial",
  "Palco e praça de alimentação",
];

export default function MapPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHeader
        title="Mapa do evento"
        subtitle="Arena e Expo conectadas pela Ponte do Pontal"
      />

      <div className="flex flex-col gap-5 px-4 pb-8">
        <section aria-labelledby="mapa-interativo-titulo">
          <div className="mb-2 flex items-end justify-between gap-3">
            <h2
              id="mapa-interativo-titulo"
              className="text-xs font-bold uppercase tracking-wider text-muted"
            >
              Visão geral
            </h2>
            <p className="text-[11px] font-medium text-muted">Arraste e use dois dedos para ampliar</p>
          </div>

          <div className="overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border-subtle">
            <EventMapViewer />
          </div>

          <p className="mt-2 text-xs leading-relaxed text-muted">
            Mapa ilustrativo, não está em escala. A Arena fica na Praça da Matriz e a Expo no
            Areal do Pontal, em lados opostos do Rio Perequê-Açu.
          </p>
        </section>

        <section aria-labelledby="locais-titulo">
          <h2
            id="locais-titulo"
            className="mb-2 text-xs font-bold uppercase tracking-wider text-muted"
          >
            Como chegar
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <LocationLink
              href="https://www.google.com/maps/search/?api=1&query=Pra%C3%A7a+da+Matriz+Paraty+RJ"
              title="Arena · Praça da Matriz"
              subtitle="Largada, chegada e recovery"
            />
            <LocationLink
              href="https://www.google.com/maps/search/?api=1&query=Areal+do+Pontal+Paraty+RJ"
              title="Expo · Areal do Pontal"
              subtitle="Kits, marcas e palco"
            />
          </div>
        </section>

        <section aria-labelledby="pontos-titulo">
          <h2
            id="pontos-titulo"
            className="mb-2 text-xs font-bold uppercase tracking-wider text-muted"
          >
            Pontos no mapa
          </h2>
          <div className="rounded-xl bg-surface p-4 ring-1 ring-border-subtle">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {ESSENTIAL_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="size-2 shrink-0 rounded-full bg-utmb-teal" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <a
          href="/images/maps/mapa-evento-2026.png"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm font-semibold text-utmb-navy transition active:scale-[0.99] dark:text-utmb-yellow"
        >
          <LinkIcon className="size-4" />
          Abrir imagem original
        </a>
      </div>
    </main>
  );
}

function LocationLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-16 items-center gap-3 rounded-xl bg-surface p-3 ring-1 ring-border-subtle transition active:scale-[0.99]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-utmb-navy/10 text-utmb-navy dark:bg-utmb-yellow/10 dark:text-utmb-yellow">
        <PinIcon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="block text-xs text-muted">{subtitle}</span>
      </span>
    </a>
  );
}
