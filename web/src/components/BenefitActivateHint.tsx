import Link from "next/link";

/** Instrução no catálogo — o cupom verbal foi aposentado. */
export function BenefitActivateHint({ partnerName }: { partnerName: string }) {
  return (
    <div className="rounded-xl bg-utmb-yellow/15 px-4 py-3 ring-1 ring-utmb-yellow/30 dark:bg-utmb-yellow/10">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Como usar</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">
        Na hora de pagar em <strong>{partnerName}</strong>, escaneie o QR do estabelecimento e
        toque em <strong>Ativar benefício</strong>. Mostre a tela ao vivo ao garçom — não é
        preciso falar código.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Sem o QR à mão? Peça o cartão no caixa.{" "}
        <Link href="/onde-comer" className="font-semibold text-utmb-navy underline dark:text-utmb-yellow">
          Ver outros parceiros
        </Link>
      </p>
    </div>
  );
}
