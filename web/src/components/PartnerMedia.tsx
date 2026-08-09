import Image from "next/image";

import { PARTNER_CATEGORY_LABELS, type Partner, type PartnerCategory } from "@/lib/partners";

const COVER_GRADIENTS: Record<PartnerCategory, string> = {
  food: "from-utmb-navy via-utmb-navy-soft to-utmb-teal-deep",
  running: "from-utmb-navy-deep via-utmb-navy to-utmb-yellow-deep/80",
  outros: "from-utmb-navy-soft to-utmb-teal",
};

export function PartnerMedia({
  partner,
  variant = "thumbnail",
}: {
  partner: Partner;
  variant?: "thumbnail" | "hero";
}) {
  const coverUrl = partner.coverUrl;
  const dimensions = variant === "hero" ? "aspect-[16/9] w-full sm:aspect-[2/1]" : "aspect-square h-full w-full";
  const sizes = variant === "hero" ? "(max-width: 768px) calc(100vw - 32px), 640px" : "144px";

  if (coverUrl) {
    return (
      <div className={`relative ${dimensions} overflow-hidden bg-surface`}>
        <Image
          src={coverUrl}
          alt=""
          fill
          className="object-cover"
          sizes={sizes}
          loading={variant === "hero" ? "eager" : "lazy"}
        />
        {variant === "hero" ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`relative ${dimensions} overflow-hidden bg-gradient-to-br ${COVER_GRADIENTS[partner.category]}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-utmb-yellow/20 blur-2xl"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}

export function PartnerLogo({ partner, className = "h-12 w-12" }: { partner: Partner; className?: string }) {
  const logoUrl = partner.logoUrl;
  const initial = partner.name.trim().charAt(0).toUpperCase();

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={96}
        height={96}
        className={`rounded-xl bg-white object-contain p-1 shadow-md ring-1 ring-white/40 ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center rounded-xl bg-white text-lg font-extrabold text-utmb-navy shadow-md ring-1 ring-white/40 ${className}`}
    >
      {initial}
    </span>
  );
}

export function PartnerCategoryBadge({
  category,
  tone = "dark",
}: {
  category: PartnerCategory;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        tone === "dark"
          ? "bg-white/15 text-white backdrop-blur-sm"
          : "bg-utmb-navy/10 text-utmb-navy dark:bg-utmb-yellow/15 dark:text-utmb-yellow"
      }`}
    >
      {PARTNER_CATEGORY_LABELS[category]}
    </span>
  );
}
