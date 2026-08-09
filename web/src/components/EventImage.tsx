import Image from "next/image";

import { EVENT_TYPE_STYLES } from "@/lib/event-type";
import type { EventItem, EventType } from "@/lib/schedule";

import { EventTypeIcon } from "./icons";

/** Capa do evento ou placeholder na cor do tipo. */
export function EventImage({
  event,
  variant = "card",
  className = "",
}: {
  event: Pick<EventItem, "imageUrl" | "type" | "title">;
  variant?: "card" | "hero" | "thumbnail";
  className?: string;
}) {
  const src = event.imageUrl;
  const dimensions =
    variant === "hero"
      ? "h-44 w-full sm:h-52"
      : variant === "thumbnail"
        ? "h-24 w-24 shrink-0"
        : "h-28 w-full";

  if (src) {
    return (
      <div className={`relative ${dimensions} overflow-hidden ${className}`}>
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes={
            variant === "hero" ? "(max-width: 768px) 100vw, 672px" : variant === "thumbnail" ? "96px" : "160px"
          }
        />
        {variant === "hero" && (
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,26,72,0.34)_0%,rgba(0,45,116,0.18)_48%,rgba(0,196,179,0.12)_100%)]"
          />
        )}
        {variant !== "thumbnail" && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        )}
      </div>
    );
  }

  return <EventImagePlaceholder type={event.type} title={event.title} variant={variant} className={className} />;
}

function EventImagePlaceholder({
  type,
  title,
  variant,
  className,
}: {
  type: EventType;
  title: string;
  variant: "card" | "hero" | "thumbnail";
  className?: string;
}) {
  const style = EVENT_TYPE_STYLES[type];
  const dimensions =
    variant === "hero"
      ? "h-44 w-full sm:h-52"
      : variant === "thumbnail"
        ? "h-24 w-24 shrink-0"
        : "h-28 w-full";

  return (
    <div
      className={`relative flex ${dimensions} overflow-hidden bg-gradient-to-br from-utmb-navy via-utmb-navy-soft to-utmb-teal-deep ${
        variant === "thumbnail" ? "items-center justify-center p-3" : "items-end p-4"
      } ${className}`}
    >
      <div aria-hidden className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <span
        className={`relative inline-flex items-center text-white/90 ${
          variant === "thumbnail" ? "" : "gap-1.5 text-xs font-bold uppercase tracking-wide"
        }`}
      >
        <EventTypeIcon type={type} className={variant === "thumbnail" ? "h-8 w-8" : "h-4 w-4"} />
        {variant !== "thumbnail" && style.label}
      </span>
      <span className="sr-only">{title}</span>
    </div>
  );
}
