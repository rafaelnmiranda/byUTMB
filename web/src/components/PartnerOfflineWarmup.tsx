"use client";

import { useEffect } from "react";

/**
 * Após abrir o catálogo, aquece o cache do service worker com as páginas de
 * ativação — útil na serra de Paraty, onde o sinal some na hora da conta.
 */
export function PartnerOfflineWarmup({ slugs }: { slugs: string[] }) {
  useEffect(() => {
    if (slugs.length === 0) return;

    let cancelled = false;

    const run = async () => {
      try {
        await fetch("/api/partners/redeemable", { credentials: "same-origin" });
      } catch {
        /* ignore */
      }

      for (const slug of slugs) {
        if (cancelled) return;
        try {
          await fetch(`/p/${slug}`, { credentials: "same-origin" });
        } catch {
          /* ignore */
        }
        await new Promise((r) => setTimeout(r, 120));
      }
    };

    const timer = setTimeout(() => {
      void run();
    }, 900);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slugs]);

  return null;
}
