import type { SVGProps } from "react";

import type { EventType } from "@/lib/schedule";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function CloudSunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v1.5M5.6 5.6l1 1M3 12h1.5M18.4 5.6l-1 1" />
      <path d="M14.5 8.5A4 4 0 0 0 8 11" />
      <path d="M7 20h9.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.4A3 3 0 0 0 7 20Z" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function RunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="15" cy="4.5" r="1.8" />
      <path d="M13.5 9 10 11l1.5 4 1 5M13.5 9l3.5 2 2 3M11.5 15 8 17l-2 4M10 11 6 10" />
    </svg>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18V6l11-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17.5" cy="16" r="2.5" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 2.2 5.6L20 10.8l-5.8 2.2L12 19l-2.2-5.9L4 10.8l5.8-2.2Z" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </svg>
  );
}

export function CalendarPlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" />
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 13a4 4 0 0 0 5.7.4l2.6-2.6a4 4 0 1 0-5.7-5.7L11.5 6.2" />
      <path d="M14 11a4 4 0 0 0-5.7-.4l-2.6 2.6a4 4 0 1 0 5.7 5.7l1.1-1.1" />
    </svg>
  );
}

export function WifiOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m3 3 18 18" />
      <path d="M12 18h.01M8.5 14.5a5 5 0 0 1 5.7-.9M5 11a10 10 0 0 1 3.5-2.2M2 7.5A15 15 0 0 1 8 4.4M13 4.2A15 15 0 0 1 22 7.5M16.5 11c.7.4 1.4.9 2 1.5" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function ThemeAutoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TYPE_ICONS: Record<EventType, (props: IconProps) => React.ReactElement> = {
  esporte: RunIcon,
  entretenimento: MusicIcon,
  ativacao: SparkIcon,
};

export function EventTypeIcon({ type, ...props }: IconProps & { type: EventType }) {
  const Icon = TYPE_ICONS[type];
  return <Icon {...props} />;
}
