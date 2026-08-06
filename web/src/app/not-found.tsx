import Link from "next/link";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl font-extrabold text-utmb-blue dark:text-utmb-yellow">404</p>

      <h1 className="text-xl font-bold text-foreground">Página não encontrada</h1>
      <p className="max-w-xs text-sm text-muted">
        O link pode ter mudado — a programação é atualizada durante o evento.
      </p>

      <Link
        href="/programacao"
        className="rounded-full bg-utmb-blue px-5 py-2.5 text-sm font-semibold text-white dark:bg-utmb-yellow dark:text-utmb-blue"
      >
        Ver programação
      </Link>
    </main>
  );
}
