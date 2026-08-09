import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BenefitActivateHint } from "@/components/BenefitActivateHint";
import { BrandBar } from "@/components/BrandBar";
import { LinkIcon, PinIcon } from "@/components/icons";
import { PartnerCategoryBadge, PartnerLogo, PartnerMedia } from "@/components/PartnerMedia";
import { PARTNER_CATEGORY_LABELS } from "@/lib/partners";
import { getPartners } from "@/lib/partners.server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { partners } = await getPartners();
  return partners.map((partner) => ({ slug: partner.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { partners } = await getPartners();
  const partner = partners.find((item) => item.slug === slug);

  if (!partner) return { title: "Parceiro não encontrado" };

  return {
    title: partner.name,
    description: partner.description || partner.benefits[0] || PARTNER_CATEGORY_LABELS[partner.category],
  };
}

export default async function PartnerPage({ params }: Props) {
  const { slug } = await params;
  const { partners } = await getPartners();
  const partner = partners.find((item) => item.slug === slug);

  if (!partner) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <BrandBar />

      <div className="relative z-10 -mt-2 rounded-t-2xl bg-background px-4 pb-8 pt-4">
        <Link
          href="/onde-comer"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-utmb-navy dark:text-utmb-yellow"
        >
          ← Parcerias (descontos)
        </Link>

        <div className="mt-2 overflow-hidden rounded-2xl shadow-sm ring-1 ring-border-subtle">
          <PartnerMedia partner={partner} variant="hero" />
        </div>

        <div className="mt-5 flex items-start gap-3">
          <PartnerLogo partner={partner} className="h-14 w-14 shrink-0" />
          <div className="min-w-0 pt-0.5">
            <PartnerCategoryBadge category={partner.category} tone="light" />
            <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-foreground">
              {partner.name}
            </h1>
            <p className="mt-1 text-sm text-muted">{PARTNER_CATEGORY_LABELS[partner.category]}</p>
          </div>
        </div>

        {partner.description && (
          <p className="mt-5 text-[15px] leading-relaxed text-foreground">{partner.description}</p>
        )}

        {partner.benefits.length > 0 && (
          <section className="mt-6 flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Benefícios</h2>
            <ul className="flex flex-col gap-2">
              {partner.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-foreground ring-1 ring-border-subtle"
                >
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        )}

        {partner.redeemEnabled && (
          <section className="mt-6">
            <BenefitActivateHint partnerName={partner.name} />
          </section>
        )}

        {partner.conditions && partner.redeemEnabled && (
          <p className="mt-4 text-xs leading-relaxed text-muted">{partner.conditions}</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-utmb-navy px-4 py-2.5 text-sm font-semibold text-white dark:bg-utmb-yellow dark:text-utmb-navy"
            >
              <LinkIcon className="h-4 w-4" />
              Site / Instagram
            </a>
          )}

          {partner.mapsUrl && (
            <a
              href={partner.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border-subtle"
            >
              <PinIcon className="h-4 w-4" />
              Como chegar
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
