import { mkdirSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  partnerAssetFolder,
  resolveEventImageRef,
  resolvePartnerImageRef,
  resolvePublicImage,
} from "../assets.server";

describe("assets locais em public/images", () => {
  const fixtureDir = join(process.cwd(), "public/images/partners/fixture");
  const fixturePath = join(fixtureDir, "logo.webp");

  beforeAll(() => {
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(fixturePath, "fixture");
  });

  afterAll(() => {
    rmSync(fixtureDir, { recursive: true, force: true });
  });

  it("resolve parceiro _logo e _cover", () => {
    expect(partnerAssetFolder("fugu_logo")).toBe("fugu");
    expect(partnerAssetFolder("pupuspancparty_cover")).toBe("pupuspancparty");
  });

  it("encontra webp existente em public/", () => {
    expect(resolvePublicImage("images/partners/fixture/logo")).toMatch(
      /^\/images\/partners\/fixture\/logo\.webp\?v=\d+$/,
    );
  });

  it("resolve referência de parceiro para caminho local", () => {
    expect(resolvePartnerImageRef("fixture_logo")).toMatch(
      /^\/images\/partners\/fixture\/logo\.webp\?v=\d+$/,
    );
  });

  it("muda a URL quando o arquivo é substituído", () => {
    const before = resolvePublicImage("images/partners/fixture/logo");
    const changedAt = new Date(Date.now() + 10_000);
    utimesSync(fixturePath, changedAt, changedAt);

    expect(resolvePublicImage("images/partners/fixture/logo")).not.toBe(before);
  });

  it("aceita URL externa", () => {
    const url = "https://example.com/foto.jpg";
    expect(resolvePartnerImageRef(url)).toBe(url);
    expect(resolveEventImageRef(url)).toBe(url);
  });

  it("resolve evento por nome da coluna imagem", () => {
    const path = resolveEventImageRef("expo_main");
    if (path) {
      expect(path).toMatch(/\/images\/events\/expo_main\.(webp|png|jpe?g)\?v=\d+$/);
    }
  });
});
