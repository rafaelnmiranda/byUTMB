"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-5xl font-extrabold text-utmb-navy dark:text-utmb-yellow">!</p>

      <h1 className="text-xl font-bold text-foreground">Algo deu errado</h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted">
        Não foi possível carregar esta página. Pode ser instabilidade temporária da planilha ou
        da rede — tente de novo em instantes.
      </p>

      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-utmb-navy px-5 py-2.5 text-sm font-semibold text-white dark:bg-utmb-yellow dark:text-utmb-navy"
      >
        Tentar novamente
      </button>
    </main>
  );
}
