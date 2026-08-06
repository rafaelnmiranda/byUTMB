"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CalendarIcon, CloudSunIcon, HomeIcon, InfoIcon } from "./icons";

const TABS = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/programacao", label: "Programação", Icon: CalendarIcon },
  { href: "/previsao", label: "Previsão", Icon: CloudSunIcon },
  { href: "/informacoes", label: "Informações", Icon: InfoIcon },
];

export function TabBar() {
  const pathname = usePathname();

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
                className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "text-utmb-blue dark:text-utmb-yellow"
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
