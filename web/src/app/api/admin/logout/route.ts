import { NextResponse } from "next/server";

import { clearAdminSession } from "@/lib/admin-auth.server";

export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
