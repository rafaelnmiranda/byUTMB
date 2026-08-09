#!/usr/bin/env node
/**
 * Converte JPG/PNG em web/public/images/ para WebP otimizado.
 *
 * Uso:
 *   npm run images:optimize              # todas as pastas
 *   npm run images:optimize -- fugu      # só o parceiro "fugu"
 */

import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import sharp from "sharp";

const PUBLIC = join(process.cwd(), "public");
const IMAGES_ROOT = join(PUBLIC, "images");

const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function optimizeFile(sourcePath, destPath, maxWidth, quality) {
  await sharp(sourcePath)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(destPath);

  const before = statSync(sourcePath).size;
  const after = statSync(destPath).size;
  console.log(`  ✓ ${relative(PUBLIC, destPath)} (${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB)`);
}

function listPartnerDirs(filter) {
  const root = join(IMAGES_ROOT, "partners");
  if (!existsSync(root)) return [];

  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !filter || name === filter);
}

async function processPartner(slug) {
  const dir = join(IMAGES_ROOT, "partners", slug);
  if (!existsSync(dir)) return;

  for (const kind of ["logo", "cover"]) {
    const base = join(dir, kind);
    const source = [...SOURCE_EXT].map((ext) => `${base}${ext}`).find((path) => existsSync(path));

    if (!source) continue;

    const dest = `${base}.webp`;
    if (source === dest) continue;

    await optimizeFile(source, dest, kind === "logo" ? 512 : 1400, kind === "logo" ? 82 : 80);
  }
}

async function processEvents() {
  const dir = join(IMAGES_ROOT, "events");
  if (!existsSync(dir)) return;

  for (const file of readdirSync(dir)) {
    const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
    if (!SOURCE_EXT.has(ext)) continue;

    const source = join(dir, file);
    if (!statSync(source).isFile()) continue;

    const name = basename(file, ext);
    const dest = join(dir, `${name}.webp`);
    if (source === dest) continue;

    await optimizeFile(source, dest, 1400, 80);
  }
}

async function main() {
  const filter = process.argv[2];

  if (!existsSync(IMAGES_ROOT)) {
    mkdirSync(IMAGES_ROOT, { recursive: true });
  }

  console.log("Otimizando imagens em public/images/…\n");

  const partners = listPartnerDirs(filter);
  if (filter && partners.length === 0) {
    console.error(`Parceiro "${filter}" não encontrado em public/images/partners/`);
    process.exit(1);
  }

  for (const slug of partners) {
    console.log(`Parceiro: ${slug}`);
    await processPartner(slug);
  }

  if (!filter) {
    console.log("\nEventos:");
    await processEvents();
  }

  console.log("\nPronto. Commit public/images/ e redeploy.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
