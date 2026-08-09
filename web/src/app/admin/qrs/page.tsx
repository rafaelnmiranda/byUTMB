import { redirect } from "next/navigation";
import QRCode from "qrcode";

import { PrintButton } from "@/components/admin/PrintButton";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";
import { getPartners } from "@/lib/partners.server";
import { primaryBenefit } from "@/lib/redeem";
import { partnerRedeemUrl } from "@/lib/redeem.server";

export const metadata = {
  title: "QRs parceiros",
  robots: { index: false, follow: false },
};

const SUPPORT_PHONE =
  process.env.PARTNER_SUPPORT_PHONE?.trim() || "Contato UTMB (produção)";

export default async function AdminQrsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/imagens");
  }

  const { partners } = await getPartners();
  const redeemable = partners.filter((p) => p.redeemEnabled);

  const sheets = await Promise.all(
    redeemable.map(async (partner) => {
      const url = partnerRedeemUrl(partner.slug);
      const qrDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 512,
        color: { dark: "#002d74", light: "#ffffff" },
      });
      return {
        partner,
        url,
        qrDataUrl,
        benefit: primaryBenefit(partner) ?? "",
      };
    }),
  );

  return (
    <main className="bg-white text-black">
      <div className="mx-auto max-w-3xl px-4 py-6 print:hidden">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">QRs para impressão</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Uma folha A4 por parceiro. Use “Imprimir” · plastifique o cartão superior.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/admin/resgates" className="text-sm font-semibold underline">
              Resgates
            </a>
            <PrintButton />
          </div>
        </header>
      </div>

      {sheets.length === 0 ? (
        <p className="px-8 py-16 text-center text-sm text-neutral-600 print:hidden">
          Nenhum parceiro com resgate ativo.
        </p>
      ) : (
        sheets.map(({ partner, url, qrDataUrl, benefit }) => (
          <section
            key={partner.slug}
            className="mx-auto flex min-h-[100vh] max-w-[210mm] flex-col justify-between gap-8 border-b border-dashed border-neutral-300 px-8 py-10 print:break-after-page print:border-0"
          >
            <div className="flex flex-col items-center text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#002d74]">
                Paraty Brazil by UTMB
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight">{partner.name}</h2>
              <p className="mt-2 max-w-md text-lg font-semibold text-[#002d74]">{benefit}</p>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`QR ${partner.name}`}
                className="mt-8 h-56 w-56 rounded-2xl border border-neutral-200"
              />

              <p className="mt-6 max-w-sm text-base font-semibold leading-snug">
                Atleta: escaneie → toque em <em>Ativar benefício</em> → mostre a tela ao vivo.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-300 px-5 py-4 text-left text-sm leading-relaxed">
              <p className="font-bold uppercase tracking-wider text-neutral-500">Para a equipe</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Indique este QR (mesa, porta-conta ou caixa).</li>
                <li>O atleta ativa no celular — não digite código.</li>
                <li>Confira nome do restaurante + relógio/código em movimento (3 min).</li>
              </ol>
              <p className="mt-3 text-xs text-neutral-600">
                <strong>Fallback sem sinal:</strong> se a ativação não abrir, o responsável pode
                aceitar a página do parceiro no app (`/onde-comer`), conforme combinado com a UTMB.
              </p>
              <p className="mt-2 text-xs text-neutral-600">
                Suporte: {SUPPORT_PHONE}
                <br />
                <span className="break-all font-mono text-[10px] text-neutral-400">{url}</span>
              </p>
            </div>
          </section>
        ))
      )}
    </main>
  );
}
