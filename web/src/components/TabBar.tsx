"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CalendarIcon, CloudSunIcon, DollarIcon, HomeIcon, InfoIcon, MapIcon } from "./icons";

const TABS = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/programacao", label: "Programação", Icon: CalendarIcon },
  { href: "/mapa", label: "Mapa", Icon: MapIcon },
  { href: "/onde-comer", label: "Descontos", Icon: DollarIcon },
  { href: "/previsao", label: "Previsão", Icon: CloudSunIcon },
  { href: "/informacoes", label: "Info", Icon: InfoIcon },
];

export function TabBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-surface/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-2xl">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-0.5 py-2 text-[9px] font-medium transition-colors min-[390px]:text-[10px] sm:gap-1 sm:px-1 sm:py-2.5 sm:text-[11px] ${
                  active
                    ? "text-utmb-navy dark:text-utmb-yellow"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.1 : 1.7} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
