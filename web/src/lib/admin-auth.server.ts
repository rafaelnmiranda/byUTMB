import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "byutmb_admin";

/** Senha padrão em dev local — sobrescreva com ADMIN_PASSWORD no .env.local. */
const DEV_FALLBACK_PASSWORD = "byutmb2026";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || DEV_FALLBACK_PASSWORD;
}

export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD?.trim() || DEV_FALLBACK_PASSWORD;
  return createHmac("sha256", secret).update("byutmb-admin-session").digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === sessionToken();
}

export async function setAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Upload só persiste em disco no dev local (Vercel é read-only). */
export function isAdminUploadAllowed(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.ADMIN_UPLOADS_ENABLED === "true";
}
