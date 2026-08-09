import { NextResponse } from "next/server";

import { recordActivation } from "@/lib/activations.server";
import { getPartners } from "@/lib/partners.server";
import { checkRedeemAvailability } from "@/lib/redeem";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const partnerSlug =
    typeof body === "object" && body && "partnerSlug" in body
      ? String((body as { partnerSlug: unknown }).partnerSlug ?? "").trim()
      : "";

  if (!partnerSlug) {
    return NextResponse.json({ error: "partnerSlug obrigatório" }, { status: 400 });
  }

  const { partners } = await getPartners();
  const partner = partners.find((item) => item.slug === partnerSlug);
  if (!partner || !partner.redeemEnabled) {
    return NextResponse.json({ error: "Parceiro inválido" }, { status: 404 });
  }

  const availability = checkRedeemAvailability(partner);
  if (!availability.ok) {
    return NextResponse.json({ error: "Fora da validade", reason: availability.reason }, { status: 403 });
  }

  const event = await recordActivation({
    partnerSlug: partner.slug,
    partnerName: partner.name,
  });

  return NextResponse.json({ ok: true, at: event.at });
}
