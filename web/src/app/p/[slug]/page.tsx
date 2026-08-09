import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BenefitRedeemFlow } from "@/components/BenefitRedeemFlow";
import { BrandBar } from "@/components/BrandBar";
import { toRedeemablePartner } from "@/lib/partners";
import { getPartners } from "@/lib/partners.server";
import { verifyPartnerRedeemToken } from "@/lib/redeem.server";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ k?: string }>;
}

export async function generateStaticParams() {
  const { partners } = await getPartners();
  return partners.filter((p) => p.redeemEnabled).map((partner) => ({ slug: partner.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { partners } = await getPartners();
  const partner = partners.find((item) => item.slug === slug);
  if (!partner) return { title: "Benefício" };
  return {
    title: `Benefício · ${partner.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function PartnerRedeemPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { k } = await searchParams;
  const { partners } = await getPartners();
  const partner = partners.find((item) => item.slug === slug);

  if (!partner) notFound();

  const tokenOk = verifyPartnerRedeemToken(slug, k);
  const redeemable = toRedeemablePartner(partner);

  return (
    <main className="flex flex-1 flex-col">
      <BrandBar />
      <div className="relative z-10 -mt-2 flex flex-1 flex-col rounded-t-2xl bg-background px-4 pb-10 pt-4">
        <Link
          href={`/onde-comer/${partner.slug}`}
          className="mb-4 inline-flex w-fit items-center gap-1 py-1 text-sm font-semibold text-utmb-navy dark:text-utmb-yellow"
        >
          ← {partner.name}
        </Link>
        <BenefitRedeemFlow partner={redeemable} tokenOk={tokenOk} />
      </div>
    </main>
  );
}
