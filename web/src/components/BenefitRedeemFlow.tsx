"use client";

import { useEffect, useRef, useState } from "react";

import type { RedeemablePartner } from "@/lib/partners";
import {
  REDEEM_WINDOW_MS,
  checkRedeemAvailability,
  formatCountdown,
  formatParatyClock,
  liveProofCode,
  primaryBenefit,
} from "@/lib/redeem";

type Phase = "ready" | "live" | "expired";

export function BenefitRedeemFlow({
  partner,
  tokenOk,
}: {
  partner: RedeemablePartner;
  tokenOk: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const recorded = useRef(false);

  const availability = checkRedeemAvailability(partner, new Date(nowMs));
  const benefit = primaryBenefit(partner);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const activate = () => {
    const start = Date.now();
    setNowMs(start);
    setExpiresAt(start + REDEEM_WINDOW_MS);
    setPhase("live");

    if (!recorded.current) {
      recorded.current = true;
      void fetch("/api/activations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ partnerSlug: partner.slug }),
        keepalive: true,
      }).catch(() => {
        /* métrica best-effort */
      });
    }
  };

  if (!tokenOk) {
    return (
      <StateCard
        title="QR inválido"
        body="Este link não corresponde ao QR oficial do estabelecimento. Peça o cartão plastificado no caixa ou na mesa."
      />
    );
  }

  if (!partner.redeemEnabled || !benefit) {
    return (
      <StateCard
        title="Benefício indisponível"
        body="Este parceiro não está com resgate ativo no momento."
      />
    );
  }

  if (!availability.ok) {
    const body =
      availability.reason === "before"
        ? `O benefício começa em ${formatDayBr(partner.validFrom)}.`
        : availability.reason === "after"
          ? `O benefício encerrou em ${formatDayBr(partner.validTo)}.`
          : "Benefício inativo.";
    return <StateCard title="Fora da validade" body={body} />;
  }

  if (phase === "ready") {
    return (
      <div className="flex flex-col gap-5">
        <PartnerHeader partner={partner} benefit={benefit} />
        <p className="text-sm leading-relaxed text-muted">{partner.conditions}</p>
        <p className="rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-foreground ring-1 ring-border-subtle">
          Mostre a próxima tela ao garçom na hora de pagar. Ela fica válida por{" "}
          <strong>3 minutos</strong>.
        </p>
        <button
          type="button"
          onClick={activate}
          className="rounded-2xl bg-utmb-yellow px-4 py-4 text-center text-base font-extrabold text-utmb-navy transition active:scale-[0.99]"
        >
          Ativar benefício
        </button>
      </div>
    );
  }

  if (phase === "expired" || (expiresAt !== null && nowMs >= expiresAt)) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-surface px-4 py-8 text-center ring-1 ring-border-subtle">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Expirado</p>
          <h2 className="mt-2 text-2xl font-extrabold text-foreground">Benefício encerrado</h2>
          <p className="mt-2 text-sm text-muted">
            A comprovação durou 3 minutos. Se ainda estiver na conta, ative de novo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            recorded.current = false;
            setPhase("ready");
            setExpiresAt(null);
          }}
          className="rounded-2xl bg-utmb-navy px-4 py-3.5 text-center text-sm font-bold text-white dark:bg-utmb-yellow dark:text-utmb-navy"
        >
          Ativar novamente
        </button>
      </div>
    );
  }

  const remaining = (expiresAt ?? nowMs) - nowMs;
  const proof = liveProofCode(partner.slug, nowMs);

  return (
    <div className="flex flex-col gap-4">
      <div className="redeem-pulse relative overflow-hidden rounded-2xl bg-utmb-navy px-4 py-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,198,41,0.35),transparent_55%)]" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-utmb-yellow">
            Válido agora
          </p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight">{partner.name}</h2>
          <p className="mt-3 text-lg font-semibold leading-snug text-utmb-yellow">{benefit}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Paraty
              </p>
              <p className="mt-1 font-mono text-sm font-bold tabular-nums">
                {formatParatyClock(nowMs)}
              </p>
            </div>
            <div className="rounded-xl bg-utmb-yellow px-3 py-3 text-utmb-navy">
              <p className="text-[10px] font-bold uppercase tracking-wider">Expira em</p>
              <p className="mt-1 font-mono text-2xl font-extrabold tabular-nums">
                {formatCountdown(remaining)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-white/40 px-3 py-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              Código ao vivo
            </p>
            <p className="mt-1 font-mono text-3xl font-extrabold tracking-[0.35em] text-utmb-yellow">
              {proof}
            </p>
            <div className="mx-auto mt-3 flex h-1.5 w-40 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-utmb-yellow transition-[width] duration-200 ease-linear"
                style={{ width: `${Math.max(0, (remaining / REDEEM_WINDOW_MS) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs leading-relaxed text-muted">{partner.conditions}</p>
    </div>
  );
}

function PartnerHeader({
  partner,
  benefit,
}: {
  partner: RedeemablePartner;
  benefit: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {partner.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logoUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl bg-surface object-cover ring-1 ring-border-subtle"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-utmb-navy text-lg font-extrabold text-utmb-yellow">
          {partner.name.slice(0, 1)}
        </div>
      )}
      <div className="min-w-0 pt-0.5">
        <h1 className="text-xl font-extrabold leading-tight text-foreground">{partner.name}</h1>
        <p className="mt-1 text-sm font-semibold text-utmb-navy dark:text-utmb-yellow">{benefit}</p>
      </div>
    </div>
  );
}

function StateCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-surface px-4 py-8 text-center ring-1 ring-border-subtle">
      <h1 className="text-xl font-extrabold text-foreground">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function formatDayBr(dayKey: string): string {
  const [y, m, d] = dayKey.split("-");
  return `${d}/${m}/${y}`;
}
