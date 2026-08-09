"use client";

import { useMemo, useState } from "react";

import { PARTNER_CATEGORY_LABELS, type Partner, type PartnerCategory } from "@/lib/partners";

import { PartnerCard } from "./PartnerCard";

const CATEGORIES: PartnerCategory[] = ["food", "running", "outros"];

interface Props {
  partners: Partner[];
}

export function PartnerBrowser({ partners }: Props) {
  const [category, setCategory] = useState<PartnerCategory | "all">("all");

  const visible = useMemo(() => {
    if (category === "all") return partners;
    return partners.filter((partner) => partner.category === category);
  }, [partners, category]);

  const counts = useMemo(() => {
    const map = new Map<PartnerCategory, number>();
    for (const partner of partners) {
      map.set(partner.category, (map.get(partner.category) ?? 0) + 1);
    }
    return map;
  }, [partners]);

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")} label="Todos" />
          {CATEGORIES.filter((item) => (counts.get(item) ?? 0) > 0).map((item) => (
            <FilterChip
              key={item}
              active={category === item}
              onClick={() => setCategory(item)}
              label={PARTNER_CATEGORY_LABELS[item]}
            />
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border-subtle">
          Nenhum parceiro nesta categoria ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((partner) => (
            <li key={partner.slug}>
              <PartnerCard partner={partner} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-utmb-navy text-white dark:bg-utmb-yellow dark:text-utmb-navy"
          : "bg-surface text-muted ring-1 ring-border-subtle"
      }`}
    >
      {label}
    </button>
  );
}
