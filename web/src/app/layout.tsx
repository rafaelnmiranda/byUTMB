import type { Metadata, Viewport } from "next";

import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { TabBar } from "@/components/TabBar";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Paraty Brazil by UTMB",
    template: "%s · Paraty Brazil by UTMB",
  },
  description:
    "Programação, informações e previsão do tempo do Paraty Brazil by UTMB — trail running em Paraty, Rio de Janeiro.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Paraty by UTMB",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Paraty Brazil by UTMB",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d11" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full">
      <body>
        <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">{children}</div>
        <TabBar />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
