import "server-only";

import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

import sharp from "sharp";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export type UploadKind = "logo" | "cover" | "event";

export function validateUploadPath(relativePathWithoutExt: string): boolean {
  return /^images\/partners\/[a-z0-9_-]+\/(logo|cover)$/.test(relativePathWithoutExt) ||
    /^images\/events\/[a-z0-9_-]+$/.test(relativePathWithoutExt);
}

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Formato inválido. Use JPG, PNG ou WebP.";
  }
  if (file.size > MAX_BYTES) {
    return "Arquivo muito grande (máx. 10 MB).";
  }
  return null;
}

export async function saveOptimizedUpload(
  file: File,
  relativePathWithoutExt: string,
  kind: UploadKind,
): Promise<{ url: string; bytes: number }> {
  const maxWidth = kind === "logo" ? 512 : 1400;
  const quality = kind === "logo" ? 82 : 80;
  const buffer = Buffer.from(await file.arrayBuffer());
  const destPath = join(process.cwd(), "public", `${relativePathWithoutExt}.webp`);

  mkdirSync(dirname(destPath), { recursive: true });

  await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(destPath);

  return {
    url: `/${relativePathWithoutExt}.webp`,
    bytes: statSync(destPath).size,
  };
}
