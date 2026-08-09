"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { AssetInventory, AssetKind, AssetSlot } from "@/lib/admin-assets.types";
import { replacementConfirmationMessage } from "@/lib/admin-upload-confirmation";

type Filter = "all" | "missing" | "complete" | "partners" | "events";

interface AssetAdminProps {
  initialAuthenticated: boolean;
}

function kindLabel(kind: AssetKind): string {
  if (kind === "partner-logo") return "Logo";
  if (kind === "partner-cover") return "Capa";
  return "Evento";
}

function uploadKind(slot: AssetSlot): "logo" | "cover" | "event" {
  if (slot.kind === "partner-logo") return "logo";
  if (slot.kind === "partner-cover") return "cover";
  return "event";
}

export function AssetAdmin({ initialAuthenticated }: AssetAdminProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<AssetInventory | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const response = await fetch("/api/admin/assets");
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Falha ao carregar inventário.");
      }
      setInventory(await response.json());
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      void loadInventory();
    }
  }, [authenticated, loadInventory]);

  const filteredSlots = useMemo(() => {
    if (!inventory) return [];

    return inventory.slots.filter((slot) => {
      if (filter === "missing" && slot.status !== "missing") return false;
      if (filter === "complete" && slot.status !== "complete") return false;
      if (filter === "partners" && !slot.kind.startsWith("partner-")) return false;
      if (filter === "events" && slot.kind !== "event") return false;

      if (query.trim()) {
        const haystack = `${slot.group} ${slot.label} ${slot.ref}`.toLowerCase();
        if (!haystack.includes(query.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [inventory, filter, query]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setLoginError("Senha incorreta.");
      return;
    }

    setAuthenticated(true);
    setPassword("");
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setInventory(null);
  }

  async function handleUpload(slot: AssetSlot, file: File) {
    if (slot.status === "external" || !slot.relativePath) return;

    const confirmationMessage = replacementConfirmationMessage(slot);
    if (confirmationMessage && !window.confirm(confirmationMessage)) return;

    setUploadingId(slot.id);
    setUploadErrors((prev) => {
      const next = { ...prev };
      delete next[slot.id];
      return next;
    });

    const form = new FormData();
    form.append("file", file);
    form.append("relativePath", slot.relativePath);
    form.append("kind", uploadKind(slot));

    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setUploadErrors((prev) => ({ ...prev, [slot.id]: payload.error ?? "Falha no upload." }));
        return;
      }

      await loadInventory();
    } catch {
      setUploadErrors((prev) => ({ ...prev, [slot.id]: "Falha no upload." }));
    } finally {
      setUploadingId(null);
    }
  }

  if (!authenticated) {
    return (
      <section className="mx-auto w-full max-w-md rounded-2xl bg-surface p-6 ring-1 ring-border-subtle">
        <h1 className="text-xl font-semibold text-foreground">Admin · Imagens</h1>
        <p className="mt-2 text-sm text-muted">
          Área oculta para enviar logos, capas e fotos de eventos para{" "}
          <code className="text-xs">public/images/</code>.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-border-subtle bg-background px-3 py-2.5"
              required
            />
          </label>

          {loginError ? <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-utmb-navy px-4 py-2.5 text-sm font-semibold text-white dark:bg-utmb-yellow dark:text-utmb-navy-deep"
          >
            Entrar
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Admin · Imagens</h1>
            <p className="mt-1 text-sm text-muted">
              Inventário da planilha × arquivos em <code className="text-xs">public/images/</code>
            </p>
            <p className="mt-2 flex flex-wrap gap-3 text-sm font-semibold">
              <a href="/admin/qrs" className="text-utmb-navy underline dark:text-utmb-yellow">
                QRs para impressão
              </a>
              <a href="/admin/resgates" className="text-utmb-navy underline dark:text-utmb-yellow">
                Resgates
              </a>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg px-3 py-1.5 text-sm text-muted ring-1 ring-border-subtle hover:text-foreground"
          >
            Sair
          </button>
        </div>

        {inventory ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge label={`${inventory.summary.total} total`} />
            <Badge label={`${inventory.summary.complete} ok`} tone="ok" />
            <Badge label={`${inventory.summary.missing} faltando`} tone="warn" />
            {inventory.summary.external > 0 ? (
              <Badge label={`${inventory.summary.external} URL externa`} />
            ) : null}
          </div>
        ) : null}

        {!inventory?.uploadsEnabled ? (
          <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            Upload desabilitado neste ambiente. Use em <strong>localhost</strong> para gravar arquivos.
          </p>
        ) : null}
      </header>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["missing", "Faltando"],
              ["all", "Todos"],
              ["complete", "Completos"],
              ["partners", "Parceiros"],
              ["events", "Eventos"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                filter === value
                  ? "bg-utmb-navy text-white ring-utmb-navy dark:bg-utmb-yellow dark:text-utmb-navy-deep dark:ring-utmb-yellow"
                  : "bg-surface text-muted ring-border-subtle hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome ou referência…"
          className="w-full rounded-xl border border-border-subtle bg-surface px-3 py-2.5 text-sm"
        />
      </div>

      {loading && !inventory ? <p className="text-sm text-muted">Carregando inventário…</p> : null}
      {fetchError ? <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p> : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {filteredSlots.map((slot) => (
          <AssetCard
            key={slot.id}
            slot={slot}
            uploading={uploadingId === slot.id}
            uploadError={uploadErrors[slot.id]}
            uploadsEnabled={inventory?.uploadsEnabled ?? false}
            onUpload={(file) => void handleUpload(slot, file)}
          />
        ))}
      </ul>

      {inventory && filteredSlots.length === 0 ? (
        <p className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted ring-1 ring-border-subtle">
          Nenhum item neste filtro.
        </p>
      ) : null}
    </section>
  );
}

function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  const classes =
    tone === "ok"
      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
      : tone === "warn"
        ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
        : "bg-surface text-muted ring-1 ring-border-subtle";

  return <span className={`rounded-full px-2.5 py-1 font-medium ${classes}`}>{label}</span>;
}

function AssetCard({
  slot,
  uploading,
  uploadError,
  uploadsEnabled,
  onUpload,
}: {
  slot: AssetSlot;
  uploading: boolean;
  uploadError?: string;
  uploadsEnabled: boolean;
  onUpload: (file: File) => void;
}) {
  const canUpload = uploadsEnabled && slot.status !== "external" && Boolean(slot.relativePath);

  return (
    <li className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border-subtle">
      <div className="relative aspect-[16/10] bg-background">
        {slot.url ? (
          <Image
            src={slot.url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
            unoptimized={slot.url.startsWith("http")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">Sem imagem</div>
        )}

        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            slot.status === "complete"
              ? "bg-emerald-600 text-white"
              : slot.status === "external"
                ? "bg-slate-600 text-white"
                : "bg-amber-500 text-utmb-navy-deep"
          }`}
        >
          {slot.status === "complete" ? "Ok" : slot.status === "external" ? "URL" : "Falta"}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <div>
          <p className="font-medium text-foreground">{slot.group}</p>
          <p className="text-xs text-muted">
            {kindLabel(slot.kind)} · <code>{slot.ref}</code>
          </p>
        </div>

        {canUpload ? (
          <label className="block">
            <span className="sr-only">Enviar imagem para {slot.ref}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file);
                event.target.value = "";
              }}
              className="block w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-utmb-navy file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white dark:file:bg-utmb-yellow dark:file:text-utmb-navy-deep"
            />
          </label>
        ) : null}

        {uploading ? <p className="text-xs text-muted">Otimizando e salvando…</p> : null}
        {uploadError ? <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p> : null}
      </div>
    </li>
  );
}
