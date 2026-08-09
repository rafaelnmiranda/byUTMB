import { NextResponse } from "next/server";

import { getAssetInventory } from "@/lib/admin-assets.server";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const inventory = await getAssetInventory();
  return NextResponse.json(inventory);
}
