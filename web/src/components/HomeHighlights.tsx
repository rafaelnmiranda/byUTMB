import Link from "next/link";

import { CalendarIcon, ChevronIcon, DollarIcon } from "./icons";

/** Destaques objetivos do que o atleta encontra no app. */
export function HomeHighlights() {
  return (
    <section aria-labelledby="no-app-titulo" className="flex flex-col gap-3">
      <div>
        <h2
          id="no-app-titulo"
          className="text-xs font-bold uppercase tracking-wider text-muted"
        >
          No app
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Programação do evento e descontos em Paraty, direto na barra inferior.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        <li>
          <HighlightLink
            href="/programacao"
            title="Programação"
            description="Horários, locais e atividades de todos os dias do evento."
            Icon={CalendarIcon}
            accent="navy"
          />
        </li>
        <li>
          <HighlightLink
            href="/onde-comer"
            title="Descontos em Paraty"
            description="Benefícios em restaurantes e parceiros durante o evento."
            Icon={DollarIcon}
            accent="yellow"
          />
        </li>
      </ul>
    </section>
  );
}

function HighlightLink({
  href,
  title,
  description,
  Icon,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  accent: "navy" | "yellow";
}) {
  const iconWrap =
    accent === "yellow"
      ? "bg-utmb-yellow text-utmb-navy-deep"
      : "bg-utmb-navy text-utmb-yellow dark:bg-utmb-yellow dark:text-utmb-navy-deep";

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3.5 ring-1 ring-border-subtle transition active:scale-[0.99]"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{description}</span>
      </span>
      <ChevronIcon className="h-4 w-4 shrink-0 text-muted/60" />
    </Link>
  );
}
