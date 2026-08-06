import { describe, expect, it } from "vitest";

import { capitalizeFirst, formatDateRange, formatDayLong, formatDayShort, formatRelative, formatTimeRange } from "../format";

describe("formatação de datas", () => {
  it("mostra o horário de Paraty, não o do aparelho", () => {
    // 13:00 UTC = 10:00 em Paraty. Um atleta com o celular em outro fuso
    // precisa ver o horário do evento, não o de casa.
    expect(formatTimeRange("2025-09-18T13:00:00.000Z", "2025-09-19T00:00:00.000Z")).toBe(
      "10:00 – 21:00",
    );
  });

  it("maiusculiza só a primeira letra do dia", () => {
    // `text-transform: capitalize` produziria "Quinta-Feira, 18 De Setembro".
    expect(formatDayLong("2025-09-18")).toBe("Quinta-feira, 18 de setembro");
  });

  it("usa rótulo curto no seletor de dias", () => {
    expect(formatDayShort("2025-09-18")).toBe("Qui 18");
  });

  it("monta o intervalo a partir dos dias, sem data fixa no código", () => {
    expect(formatDateRange(["2025-09-18", "2025-09-19", "2025-09-21"])).toBe(
      "18 a 21 de setembro de 2025",
    );
  });

  it("atravessa a virada de mês", () => {
    expect(formatDateRange(["2025-10-30", "2025-11-02"])).toBe(
      "30 de outubro de 2025 a 2 de novembro de 2025",
    );
  });

  it("descreve o tempo até o evento", () => {
    const start = Date.parse("2025-09-18T13:00:00.000Z");

    expect(formatRelative("2025-09-18T13:00:00.000Z", start)).toBe("agora");
    expect(formatRelative("2025-09-18T13:25:00.000Z", start)).toBe("em 25 min");
    expect(formatRelative("2025-09-18T15:10:00.000Z", start)).toBe("em 2h10");
    expect(formatRelative("2025-09-19T13:00:00.000Z", start)).toBe("amanhã");
  });

  it("não quebra com string vazia", () => {
    expect(capitalizeFirst("")).toBe("");
    expect(formatDateRange([])).toBe("");
  });
});
