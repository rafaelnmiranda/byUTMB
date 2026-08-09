import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildPartners } from "../partners";
import { defaultConditions } from "../redeem";

const fixture = readFileSync(join(__dirname, "fixtures/parceiros.csv"), "utf8");

describe("parceiros da planilha", () => {
  const catalog = buildPartners(fixture);

  it("carrega todos os parceiros sem descartar linha", () => {
    expect(catalog.partners.length).toBeGreaterThanOrEqual(9);
    expect(catalog.skipped).toBe(0);
  });

  it("interpreta benefícios separados por ponto e vírgula", () => {
    const pupu = catalog.partners.find((p) => p.name.includes("Pupu"));
    expect(pupu?.benefits).toHaveLength(2);
    expect(pupu?.conditions).toContain("Não cumulativo");
    expect(pupu?.validFrom).toBe("2026-09-17");
    expect(pupu?.validTo).toBe("2026-09-20");
    expect(pupu?.redeemEnabled).toBe(true);
  });

  it("aplica condições padrão quando a planilha omite", () => {
    const fugu = catalog.partners.find((p) => p.name.includes("Fugu"));
    expect(fugu?.conditions).toBe(defaultConditions());
  });

  it("respeita redeem=nao", () => {
    const yopp = catalog.partners.find((p) => p.name.includes("Yopp"));
    expect(yopp?.redeemEnabled).toBe(false);
  });

  it("classifica categorias food e running", () => {
    const categories = new Set(catalog.partners.map((p) => p.category));
    expect(categories.has("food")).toBe(true);
    expect(categories.has("running")).toBe(true);
  });

  it("gera slugs únicos", () => {
    const slugs = catalog.partners.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
