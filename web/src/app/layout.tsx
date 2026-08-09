import type { Metadata, Viewport } from "next";

import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { TabBar } from "@/components/TabBar";
import { ThemeScript } from "@/components/theme";

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
    images: [
      {
        url: "/logo-color.png",
        width: 640,
        height: 358,
        alt: "Paraty Brazil by UTMB",
      },
    ],
  },
  twitter: {
    card: "summary",
    images: ["/logo-color.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f7" },
    { media: "(prefers-color-scheme: dark)", color: "#070d1c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">{children}</div>
        <TabBar />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
