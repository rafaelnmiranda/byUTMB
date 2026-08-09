import type { AssetSlot } from "./admin-assets.types";

export function replacementConfirmationMessage(slot: AssetSlot): string | null {
  if (slot.status !== "complete") return null;

  return `“${slot.group}” já possui uma imagem. Deseja substituir a imagem atual?`;
}
