import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { ChevronIcon, LinkIcon, PinIcon } from "@/components/icons";
import { formatDateRange } from "@/lib/format";
import { getSchedule } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "Informações",
  description: "Sobre o Paraty Brazil by UTMB: local, site oficial e contato.",
};

const ABOUT =
  "Paraty Brazil by UTMB é um evento de trail running na histórica cidade de Paraty, parte da prestigiada UTMB World Series. Oferece percursos desafiadores por paisagens deslumbrantes como Mata Atlântica, montanhas e praias. O evento celebra o espírito de aventura e a conexão com a natureza, atraindo corredores de todo o mundo em busca do extraordinário.";

export default async function InfoPage() {
  const { days } = await getSchedule();
  const dateRange = formatDateRange(days.map((day) => day.key));

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader title="Informações" />

      <div className="flex flex-col gap-4 px-4 pb-8">
        {dateRange && (
          <Section title="Próxima edição">
            <p className="text-[15px] font-semibold text-foreground">{dateRange}</p>
          </Section>
        )}

        <Section title="Sobre o evento">
          <p className="text-[15px] leading-relaxed text-foreground">{ABOUT}</p>
        </Section>

        <Section title="Local">
          <ExternalRow
            href="https://maps.app.goo.gl/RdbXdpNZiR5uEGn17"
            icon={<PinIcon className="h-5 w-5" />}
            title="Paraty — RJ"
            subtitle="Abrir no Google Maps"
          />
        </Section>

        <Section title="Site oficial">
          <ExternalRow
            href="https://paraty.utmb.world/pt"
            icon={<LinkIcon className="h-5 w-5" />}
            title="paraty.utmb.world"
          />
        </Section>

        <Section title="Contato">
          <div className="flex flex-col">
            <ExternalRow
              href="mailto:paraty@service.utmb.world?subject=Contato%20pelo%20app"
              icon={<MailGlyph />}
              title="paraty@service.utmb.world"
              subtitle="E-mail"
            />
            <ExternalRow
              href="https://wa.me/5511916984686"
              icon={<WhatsAppGlyph />}
              title="+55 11 91698-4686"
              subtitle="WhatsApp"
            />
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h2>
      <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-border-subtle">
        <div className="p-4">{children}</div>
      </div>
    </section>
  );
}

function ExternalRow({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="-m-4 flex items-center gap-3 p-4 transition active:bg-foreground/5"
    >
      <span className="shrink-0 text-utmb-blue dark:text-utmb-yellow">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-foreground">{title}</span>
        {subtitle && <span className="block text-xs text-muted">{subtitle}</span>}
      </span>
      <ChevronIcon className="h-4 w-4 shrink-0 text-muted/60" />
    </a>
  );
}

function MailGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M8.8 9.2c.3 2.4 2.6 4.7 5 5l1-1.3 1.7.8-.4 1.5c-2.8.6-6.8-2.6-7.9-5.6l1.4-.7Z" />
    </svg>
  );
}
