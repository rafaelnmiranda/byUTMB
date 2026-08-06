import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paraty Brazil by UTMB",
    short_name: "Paraty by UTMB",
    description:
      "Programação, informações e previsão do tempo do Paraty Brazil by UTMB — trail running em Paraty, RJ.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#002d74",
    theme_color: "#002d74",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["sports", "travel", "events"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Programação", url: "/programacao" },
      { name: "Previsão do tempo", url: "/previsao" },
    ],
  };
}
