import type { WeatherIcon } from "@/lib/weather";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const CLOUD_PATH = "M7 19h9.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.4A3 3 0 0 0 7 19Z";

const ICONS: Record<WeatherIcon, React.ReactElement> = {
  sol: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </>
  ),
  nuvem: (
    <>
      <path d="M14.5 7.5A4 4 0 0 0 8 10" />
      <path d={CLOUD_PATH} />
    </>
  ),
  chuva: (
    <>
      <path d={CLOUD_PATH} />
      <path d="M9 21.5l-.8 1.5M13 21.5l-.8 1.5M17 21.5l-.8 1.5" />
    </>
  ),
  tempestade: (
    <>
      <path d={CLOUD_PATH} />
      <path d="m13 20-2.5 3.5h3L11 27" />
    </>
  ),
  neve: (
    <>
      <path d={CLOUD_PATH} />
      <path d="M9 22h.01M13 22h.01M17 22h.01" />
    </>
  ),
  neblina: (
    <>
      <path d="M4 9h16M6 13h12M4 17h16" />
    </>
  ),
};

export function WeatherGlyph({ icon, className }: { icon: WeatherIcon; className?: string }) {
  return (
    <svg {...base} className={className}>
      {ICONS[icon]}
    </svg>
  );
}
