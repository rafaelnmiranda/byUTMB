import Link from "next/link";

import { WifiOffIcon } from "@/components/icons";

export const metadata = { title: "Sem conexão" };

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <WifiOffIcon className="h-14 w-14 text-muted" />

      <h1 className="text-xl font-bold text-foreground">Você está sem conexão</h1>
      <p className="max-w-xs text-sm text-muted">
        As páginas que você já visitou continuam disponíveis. Assim que o sinal voltar, os
        horários são atualizados sozinhos.
      </p>

      <Link
        href="/programacao"
        className="rounded-full bg-utmb-navy px-5 py-2.5 text-sm font-semibold text-white dark:bg-utmb-yellow dark:text-utmb-navy"
      >
        Ver programação salva
      </Link>
    </main>
  );
}
