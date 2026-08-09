export type AssetKind = "partner-logo" | "partner-cover" | "event";
export type AssetStatus = "complete" | "missing" | "external";

export interface AssetSlot {
  id: string;
  kind: AssetKind;
  ref: string;
  label: string;
  group: string;
  relativePath: string;
  url: string | null;
  status: AssetStatus;
}

export interface AssetInventory {
  slots: AssetSlot[];
  summary: {
    total: number;
    complete: number;
    missing: number;
    external: number;
  };
  fetchedAt: string;
  uploadsEnabled: boolean;
}
