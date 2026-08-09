import { describe, expect, it } from "vitest";

import type { AssetSlot } from "../admin-assets.types";
import { replacementConfirmationMessage } from "../admin-upload-confirmation";

function slot(status: AssetSlot["status"]): AssetSlot {
  return {
    id: "partner-cover:fugu_cover",
    kind: "partner-cover",
    ref: "fugu_cover",
    label: "Capa",
    group: "Fugu Japanese Food",
    relativePath: "images/partners/fugu/cover",
    url: status === "missing" ? null : "/images/partners/fugu/cover.webp",
    status,
  };
}

describe("confirmação de substituição de imagem", () => {
  it("pede confirmação quando a imagem já existe", () => {
    expect(replacementConfirmationMessage(slot("complete"))).toBe(
      "“Fugu Japanese Food” já possui uma imagem. Deseja substituir a imagem atual?",
    );
  });

  it("não pede confirmação no primeiro envio", () => {
    expect(replacementConfirmationMessage(slot("missing"))).toBeNull();
  });
});
