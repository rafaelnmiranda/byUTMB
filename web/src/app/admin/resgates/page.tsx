import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth.server";
import { aggregateActivations } from "@/lib/activations.server";
import { getPartners } from "@/lib/partners.server";

export const metadata = {
  title: "Resgates",
  robots: { index: false, follow: false },
};

export default async function AdminResgatesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/imagens");
  }

  const [aggregates, { partners }] = await Promise.all([aggregateActivations(), getPartners()]);
  const names = new Map(partners.map((p) => [p.slug, p.name]));

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Admin</p>
          <h1 className="text-2xl font-extrabold text-foreground">Resgates (agregados)</h1>
          <p className="mt-1 text-sm text-muted">
            Sem identidade do atleta — só contagem por parceiro, dia e hora (Paraty).
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm font-semibold">
          <a href="/admin/qrs" className="text-utmb-navy underline dark:text-utmb-yellow">
            QRs para impressão
          </a>
          <a href="/admin/imagens" className="text-utmb-navy underline dark:text-utmb-yellow">
            Imagens
          </a>
        </nav>
      </header>

      {aggregates.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border-subtle">
          Nenhuma ativação registrada ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {aggregates.map((row) => (
            <li
              key={row.partnerSlug}
              className="rounded-2xl bg-surface px-4 py-4 ring-1 ring-border-subtle"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold text-foreground">
                  {row.partnerName || names.get(row.partnerSlug) || row.partnerSlug}
                </h2>
                <p className="font-mono text-2xl font-extrabold text-utmb-navy dark:text-utmb-yellow">
                  {row.total}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(row.byDay)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([day, count]) => (
                    <span
                      key={day}
                      className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-border-subtle"
                    >
                      {day}: {count}
                    </span>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
