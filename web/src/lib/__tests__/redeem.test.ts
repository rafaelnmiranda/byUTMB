import { describe, expect, it } from "vitest";

import {
  checkRedeemAvailability,
  formatCountdown,
  liveProofCode,
  primaryBenefit,
} from "../redeem";
import { partnerRedeemToken, verifyPartnerRedeemToken } from "../redeem-token";

describe("redeem", () => {
  it("aceita parceiro dentro da janela", () => {
    const result = checkRedeemAvailability(
      {
        redeemEnabled: true,
        validFrom: "2026-09-17",
        validTo: "2026-09-20",
      },
      new Date("2026-09-18T15:00:00-03:00"),
    );
    expect(result).toEqual({ ok: true });
  });

  it("bloqueia antes e depois da validade", () => {
    const partner = {
      redeemEnabled: true,
      validFrom: "2026-09-17",
      validTo: "2026-09-20",
    };
    expect(
      checkRedeemAvailability(partner, new Date("2026-09-16T12:00:00-03:00")).ok,
    ).toBe(false);
    expect(
      checkRedeemAvailability(partner, new Date("2026-09-21T12:00:00-03:00")).ok,
    ).toBe(false);
  });

  it("gera código vivo estável no mesmo segundo e muda no seguinte", () => {
    const a = liveProofCode("fugu", 1_700_000_000_000);
    const b = liveProofCode("fugu", 1_700_000_000_400);
    const c = liveProofCode("fugu", 1_700_000_001_000);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^\d{6}$/);
  });

  it("formata contagem regressiva", () => {
    expect(formatCountdown(125_000)).toBe("2:05");
    expect(formatCountdown(0)).toBe("0:00");
  });

  it("extrai benefício principal", () => {
    expect(primaryBenefit({ benefits: ["10% no prato", "Drink"] })).toBe("10% no prato");
    expect(primaryBenefit({ benefits: [] })).toBeNull();
  });

  it("assina e verifica token do QR", () => {
    const token = partnerRedeemToken("casa-do-fogo");
    expect(token).toHaveLength(24);
    expect(verifyPartnerRedeemToken("casa-do-fogo", token)).toBe(true);
    expect(verifyPartnerRedeemToken("casa-do-fogo", "x".repeat(24))).toBe(false);
    expect(verifyPartnerRedeemToken("outro", token)).toBe(false);
  });
});
