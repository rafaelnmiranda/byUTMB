import Link from "next/link";

import { PARTNER_CATEGORY_LABELS, type Partner } from "@/lib/partners";

import { ChevronIcon, TagIcon } from "./icons";
import { PartnerCategoryBadge, PartnerLogo, PartnerMedia } from "./PartnerMedia";

export function PartnerCard({ partner }: { partner: Partner }) {
  const primaryBenefit = partner.benefits[0];

  return (
    <Link
      href={`/onde-comer/${partner.slug}`}
      className="group flex min-h-[120px] overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border-subtle transition hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative h-[120px] w-[120px] shrink-0 self-start overflow-hidden sm:h-36 sm:w-36">
        <PartnerMedia partner={partner} variant="thumbnail" />
        <div className="absolute bottom-2 left-2">
          <PartnerLogo partner={partner} className="h-9 w-9 shrink-0" />
        </div>
      </div>

      <div className="relative min-w-0 flex-1 p-3.5 pr-9 sm:p-4 sm:pr-10">
        <PartnerCategoryBadge category={partner.category} tone="light" />
        <h3 className="mt-2 text-[15px] font-extrabold leading-snug text-foreground">{partner.name}</h3>

        {partner.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{partner.description}</p>
        ) : (
          <p className="mt-1 text-xs text-muted">{PARTNER_CATEGORY_LABELS[partner.category]}</p>
        )}

        {primaryBenefit && (
          <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-snug text-utmb-navy dark:text-utmb-yellow">
            <TagIcon className="mt-px h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">{primaryBenefit}</span>
          </p>
        )}

        <ChevronIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted/60 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
