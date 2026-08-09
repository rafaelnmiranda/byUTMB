import type { Metadata } from "next";

import { AssetAdmin } from "@/components/admin/AssetAdmin";
import { isAdminAuthenticated } from "@/lib/admin-auth.server";

export const metadata: Metadata = {
  title: "Admin · Imagens",
  robots: { index: false, follow: false },
};

export default async function AdminImagesPage() {
  const authenticated = await isAdminAuthenticated();

  return (
    <main className="flex flex-1 flex-col px-4 pb-8 pt-4">
      <AssetAdmin initialAuthenticated={authenticated} />
    </main>
  );
}
