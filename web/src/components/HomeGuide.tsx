"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

import { ClockIcon, DollarIcon, WifiOffIcon } from "./icons";

const STORAGE_KEY = "byutmb-guia-inicial-visto";
const CHANGE_EVENT = "byutmb-guia-inicial-change";

export function HomeGuide() {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(CHANGE_EVENT, onStoreChange);

    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(CHANGE_EVENT, onStoreChange);
    };
  }, []);

  const isVisible = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(STORAGE_KEY) !== "sim",
    () => true,
  );

  if (!isVisible) return null;

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "sim");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <section
      aria-labelledby="guia-inicial-titulo"
      className="relative overflow-hidden rounded-2xl bg-utmb-navy-deep p-5 text-white shadow-lg shadow-utmb-navy/10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-36 w-36 rounded-full bg-utmb-teal/25 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-utmb-yellow">
              Comece por aqui
            </p>
            <h2 id="guia-inicial-titulo" className="mt-1 text-lg font-extrabold tracking-tight">
              Seu guia rápido do app
            </h2>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar guia inicial"
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          <GuideStep
            number="1"
            title="Veja o que vem agora"
            description="A home acompanha o horário do evento e mostra seu próximo passo."
            Icon={ClockIcon}
          />
          <GuideStep
            number="2"
            title="Aproveite descontos"
            description="Restaurantes parceiros oferecem benefícios especiais durante o evento."
            Icon={DollarIcon}
          />
          <GuideStep
            number="3"
            title="Consulte o essencial offline"
            description="Após o primeiro acesso, programação, parceiros e informações ficam salvos."
            Icon={WifiOffIcon}
          />
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link
            href="/programacao"
            className="inline-flex min-h-11 items-center rounded-xl bg-utmb-yellow px-4 py-2 text-sm font-extrabold text-utmb-navy-deep transition active:scale-[0.98]"
          >
            Explorar programação
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4"
          >
            Entendi
          </button>
        </div>
      </div>
    </section>
  );
}

function GuideStep({
  number,
  title,
  description,
  Icon,
}: {
  number: string;
  title: string;
  description: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}) {
  return (
    <li className="flex gap-3 sm:flex-col">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-utmb-yellow ring-1 ring-white/15">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-bold">
          <span className="sr-only">Passo {number}: </span>
          {title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/70">{description}</p>
      </div>
    </li>
  );
}
