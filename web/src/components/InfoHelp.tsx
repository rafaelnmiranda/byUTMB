import Link from "next/link";
import type { ReactElement } from "react";

import {
  CalendarIcon,
  ChevronIcon,
  CloudSunIcon,
  DollarIcon,
  HomeIcon,
  InfoIcon,
  WifiOffIcon,
} from "./icons";

type HelpItem = {
  title: string;
  body: string;
  Icon: (props: { className?: string }) => ReactElement;
  href?: string;
};

const HELP_ITEMS: HelpItem[] = [
  {
    title: "Como navegar",
    body: "Use a barra na parte inferior da tela: Início, Programação, Descontos, Previsão e Info. Toque em qualquer aba para ir direto à seção.",
    Icon: InfoIcon,
  },
  {
    title: "Início",
    body: "A home mostra o que está acontecendo agora, o próximo evento e atalhos para programação e descontos.",
    Icon: HomeIcon,
    href: "/",
  },
  {
    title: "Programação",
    body: "Escolha o dia no topo da tela e toque em um evento para ver horário, local e descrição. As cores indicam esporte, entretenimento e ativação.",
    Icon: CalendarIcon,
    href: "/programacao",
  },
  {
    title: "Descontos",
    body: "Restaurantes parceiros oferecem benefícios durante o evento. Abra o local, confira a oferta e apresente no estabelecimento.",
    Icon: DollarIcon,
    href: "/onde-comer",
  },
  {
    title: "Previsão",
    body: "Consulte o clima de Paraty atualizado para os dias do evento — útil para se preparar antes das largadas e atividades ao ar livre.",
    Icon: CloudSunIcon,
    href: "/previsao",
  },
  {
    title: "Usar offline",
    body: "Depois do primeiro acesso com internet, programação, parceiros e informações ficam salvos no celular. No iPhone: Compartilhar → Adicionar à Tela de Início. No Android: menu do Chrome → Instalar app.",
    Icon: WifiOffIcon,
  },
];

export function InfoHelp() {
  return (
    <section className="flex flex-col gap-2" aria-labelledby="ajuda-titulo">
      <h2 id="ajuda-titulo" className="text-xs font-bold uppercase tracking-wider text-muted">
        Ajuda
      </h2>
      <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-border-subtle">
        {HELP_ITEMS.map(({ title, body, Icon, href }) => (
          <details
            key={title}
            className="group border-t border-border-subtle first:border-t-0 open:bg-foreground/[0.02]"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="shrink-0 text-utmb-navy dark:text-utmb-yellow">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-semibold text-foreground">
                {title}
              </span>
              <ChevronIcon className="h-4 w-4 shrink-0 text-muted/60 transition-transform group-open:rotate-90" />
            </summary>
            <div className="space-y-3 px-4 pb-4 pt-0">
              <p className="text-sm leading-relaxed text-muted">{body}</p>
              {href && (
                <Link
                  href={href}
                  className="inline-flex min-h-10 items-center text-sm font-semibold text-utmb-navy underline decoration-utmb-navy/30 underline-offset-4 dark:text-utmb-yellow dark:decoration-utmb-yellow/40"
                >
                  Ir para {title.toLowerCase()}
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
