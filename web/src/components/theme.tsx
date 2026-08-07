"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ThemePreference = "auto" | "light" | "dark";

export const THEME_STORAGE_KEY = "byutmb-tema";

/**
 * Script executado antes da primeira pintura.
 *
 * Sem ele, a página apareceria clara por um instante antes do React assumir —
 * a "piscada branca" que incomoda especialmente quem abre o app de madrugada,
 * na largada. Fica inline no <head> justamente para rodar antes de tudo.
 */
export function ThemeScript() {
  const script = `(function(){try{
var p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||"auto";
var d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.setAttribute("data-theme",d?"dark":"light");
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

function readPreference(): ThemePreference {
  if (typeof localStorage === "undefined") return "auto";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "auto";
}

function applyPreference(preference: ThemePreference) {
  const prefersDark =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = preference === "dark" || (preference === "auto" && prefersDark);

  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

/** Guarda a preferência e avisa quem estiver escutando (útil se houver mais de um botão). */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);

  const media = matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    // Só segue o sistema quando a preferência é "auto".
    if (readPreference() === "auto") applyPreference("auto");
    onChange();
  };

  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useTheme() {
  const preference = useSyncExternalStore(
    subscribe,
    readPreference,
    () => "auto" as ThemePreference,
  );

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      if (next === "auto") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Modo privado do Safari pode recusar a escrita — o tema ainda vale nesta sessão.
    }
    applyPreference(next);
    listeners.forEach((notify) => notify());
  }, []);

  return { preference, setPreference };
}

