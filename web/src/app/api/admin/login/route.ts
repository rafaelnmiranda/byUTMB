import { NextResponse } from "next/server";

import { setAdminSession, verifyAdminPassword } from "@/lib/admin-auth.server";

export async function POST(request: Request) {
  let password = "";

  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
