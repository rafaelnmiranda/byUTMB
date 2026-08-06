"use client";

import { useState } from "react";

import { ShareIcon } from "./icons";

/**
 * Compartilhar um evento. É o equivalente ao ShareSheet do app iOS — mas aqui o
 * que vai junto é a URL, então quem recebe abre direto no evento certo. O app
 * nativo precisaria de Universal Links para fazer o mesmo.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Usuário cancelou — não é erro.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem clipboard (contexto não seguro): não há o que fazer além de ignorar.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border-subtle"
    >
      <ShareIcon className="h-4 w-4" />
      {copied ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
