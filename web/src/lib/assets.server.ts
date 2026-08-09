import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const EXTENSIONS = ["webp", "png", "jpg", "jpeg"] as const;

function publicRoot(): string {
  return join(process.cwd(), "public");
}

/**
 * Procura um arquivo em `public/` sem extensão na planilha.
 * Ex.: `images/partners/fugu/logo` → `/images/partners/fugu/logo.webp`
 */
export function resolvePublicImage(relativePathWithoutExt: string): string | null {
  const base = join(publicRoot(), relativePathWithoutExt);

  for (const ext of EXTENSIONS) {
    const filePath = `${base}.${ext}`;
    if (existsSync(filePath)) {
      const version = Math.floor(statSync(filePath).mtimeMs);
      return `/${relativePathWithoutExt}.${ext}?v=${version}`;
    }
  }

  return null;
}

/**
 * Coluna `logo` ou `partner_cover` da aba parceiros.
 *
 * - URL `https://…` → usa direto
 * - `pupuspancparty_logo` → `/images/partners/pupuspancparty/logo.webp`
 * - `pupuspancparty_cover` → `/images/partners/pupuspancparty/cover.webp`
 */
export function resolvePartnerImageRef(ref: string | null): string | null {
  if (!ref?.trim()) return null;

  const value = ref.trim();
  if (/^https?:\/\//i.test(value)) return value;

  const logoMatch = /^(.+)_logo$/i.exec(value);
  if (logoMatch) {
    return resolvePublicImage(`images/partners/${logoMatch[1]}/logo`);
  }

  const coverMatch = /^(.+)_cover$/i.exec(value);
  if (coverMatch) {
    return resolvePublicImage(`images/partners/${coverMatch[1]}/cover`);
  }

  return (
    resolvePublicImage(`images/partners/${value}/logo`) ??
    resolvePublicImage(`images/partners/${value}/cover`)
  );
}

/**
 * Coluna `imagem` da programação.
 *
 * - URL → direto
 * - `expo_main` → `/images/events/expo_main.webp`
 */
export function resolveEventImageRef(ref: string | null): string | null {
  if (!ref?.trim()) return null;

  const value = ref.trim();
  if (/^https?:\/\//i.test(value)) return value;

  return resolvePublicImage(`images/events/${value}`);
}

/** Lista de pastas de parceiro esperadas (derivada do slug antes de `_logo` / `_cover`). */
export function partnerAssetFolder(ref: string): string | null {
  const logoMatch = /^(.+)_logo$/i.exec(ref.trim());
  if (logoMatch) return logoMatch[1];

  const coverMatch = /^(.+)_cover$/i.exec(ref.trim());
  if (coverMatch) return coverMatch[1];

  return null;
}
