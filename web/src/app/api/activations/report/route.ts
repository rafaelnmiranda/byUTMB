import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth.server";
import { aggregateActivations, listActivations } from "@/lib/activations.server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const detailed = url.searchParams.get("detailed") === "1";

  if (detailed) {
    const events = await listActivations();
    return NextResponse.json({ events, total: events.length });
  }

  const aggregates = await aggregateActivations();
  return NextResponse.json({ aggregates });
}
