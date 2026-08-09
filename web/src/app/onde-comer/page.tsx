import { PageHeader, UpdatedAt } from "@/components/PageHeader";
import { PartnerBrowser } from "@/components/PartnerBrowser";
import { PartnerOfflineWarmup } from "@/components/PartnerOfflineWarmup";
import { formatUpdatedAt } from "@/lib/format";
import { getPartners } from "@/lib/partners.server";

export const metadata = {
  title: "Parcerias (descontos)",
  description: "Restaurantes e expositores com benefícios exclusivos para atletas UTMB em Paraty.",
};

export default async function OndeComerPage() {
  const { partners, fetchedAt } = await getPartners();
  const redeemSlugs = partners.filter((p) => p.redeemEnabled).map((p) => p.slug);

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader
        title="Parcerias (descontos)"
        subtitle={
          partners.length > 0
            ? `${partners.length} parceiros em Paraty · ative o benefício no QR do local`
            : "Parceiros locais em breve"
        }
      />

      <div className="px-4 pb-4">
        {partners.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border-subtle">
            A lista de restaurantes parceiros ainda não foi publicada.
          </p>
        ) : (
          <>
            <PartnerOfflineWarmup slugs={redeemSlugs} />
            <PartnerBrowser partners={partners} />
          </>
        )}
      </div>

      <UpdatedAt time={formatUpdatedAt(fetchedAt)} />
    </main>
  );
}
