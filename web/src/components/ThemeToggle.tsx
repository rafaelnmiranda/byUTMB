"use client";

import { MoonIcon, SunIcon, ThemeAutoIcon } from "./icons";
import { type ThemePreference, useTheme } from "./theme";

const ORDER: ThemePreference[] = ["auto", "light", "dark"];

const LABELS: Record<ThemePreference, string> = {
  auto: "Tema: automático",
  light: "Tema: claro",
  dark: "Tema: escuro",
};

const ICONS: Record<ThemePreference, (props: { className?: string }) => React.ReactElement> = {
  auto: ThemeAutoIcon,
  light: SunIcon,
  dark: MoonIcon,
};

/**
 * Alterna entre automático, claro e escuro.
 *
 * "Automático" segue o sistema e é o padrão — mas o atleta que quer a tela
 * escura na largada das 5h, com o celular no modo claro, consegue forçar.
 */
export function ThemeToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  // `useSyncExternalStore` devolve "auto" no servidor e o valor real logo após a
  // hidratação, então o ícone nunca aparece com o estado errado.
  const { preference, setPreference } = useTheme();
  const Icon = ICONS[preference];

  const next = () => setPreference(ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length]);

  return (
    <button
      type="button"
      onClick={next}
      aria-label={LABELS[preference]}
      title={LABELS[preference]}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95 ${
        tone === "dark"
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-surface text-foreground ring-1 ring-border-subtle hover:bg-surface-raised"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
