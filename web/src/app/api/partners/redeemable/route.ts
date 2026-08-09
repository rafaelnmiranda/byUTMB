import { NextResponse } from "next/server";

import { toRedeemablePartner } from "@/lib/partners";
import { getPartners } from "@/lib/partners.server";

export const runtime = "nodejs";

/** Catálogo enxuto para aquecer cache offline da ativação. */
export async function GET() {
  const catalog = await getPartners();
  const partners = catalog.partners.filter((p) => p.redeemEnabled).map(toRedeemablePartner);

  return NextResponse.json(
    { partners, fetchedAt: catalog.fetchedAt },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
