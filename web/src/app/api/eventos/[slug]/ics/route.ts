import { getSchedule } from "@/lib/schedule.server";

/**
 * Arquivo .ics do evento — "adicionar à agenda".
 *
 * Funciona no iOS, Android e desktop sem integração nenhuma: o sistema
 * operacional reconhece o tipo do arquivo e abre o app de calendário.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { events } = await getSchedule();
  const event = events.find((item) => item.slug === slug);

  if (!event) {
    return new Response("Evento não encontrado", { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Paraty Brazil by UTMB//PT-BR//",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}@paratybrazil.utmb`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(event.startsAt)}`,
    event.endsAt ? `DTEND:${toICSDate(event.endsAt)}` : `DURATION:PT15M`,
    foldLine(`SUMMARY:${escapeICS(event.title)}`),
    event.description ? foldLine(`DESCRIPTION:${escapeICS(event.description)}`) : null,
    event.location ? foldLine(`LOCATION:${escapeICS(event.location)}`) : null,
    siteUrl ? `URL:${siteUrl}/programacao/${event.slug}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/** ISO para o formato UTC do iCalendar: 20250918T130000Z */
function toICSDate(iso: string): string {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 limita a linha a 75 octetos; o excedente continua com um espaço. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;

  const chunks: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);

  while (rest.length > 74) {
    chunks.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  if (rest.length > 0) chunks.push(` ${rest}`);

  return chunks.join("\r\n");
}
