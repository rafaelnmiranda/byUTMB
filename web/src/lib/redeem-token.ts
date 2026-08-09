import { createHmac, timingSafeEqual } from "node:crypto";

function redeemSecret(): string {
  return (
    process.env.REDEEM_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "byutmb-redeem-dev"
  );
}

/** Token estável por parceiro — vai no QR impresso (`?k=`). */
export function partnerRedeemToken(slug: string): string {
  return createHmac("sha256", redeemSecret()).update(`redeem:${slug}`).digest("hex").slice(0, 24);
}

export function verifyPartnerRedeemToken(slug: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = partnerRedeemToken(slug);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function partnerRedeemPath(slug: string): string {
  return `/p/${slug}?k=${partnerRedeemToken(slug)}`;
}

export function partnerRedeemUrl(slug: string, siteUrl?: string): string {
  const base = (siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}${partnerRedeemPath(slug)}`;
}
