import type { EventItem } from "@/lib/schedule";

const POINT_EVENT_WINDOW_MS = 45 * 60 * 1000;

type WelcomeContext = {
  eyebrow: string;
  title: string;
  description: string;
};

export function HomeWelcome({ events, now }: { events: EventItem[]; now: number }) {
  const context = getWelcomeContext(events, now);

  return (
    <section aria-labelledby="boas-vindas-titulo" className="px-4 pb-7 pt-3">
      {context.eyebrow && (
        <p className="inline-flex rounded-full bg-white/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-utmb-navy-deep ring-1 ring-utmb-navy/15 dark:bg-white/10 dark:text-foreground dark:ring-white/20">
          {context.eyebrow}
        </p>
      )}
      <h1
        id="boas-vindas-titulo"
        className={`${context.eyebrow ? "mt-3" : ""} max-w-xl text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl`}
      >
        {context.title}
      </h1>
      <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-utmb-navy-deep/75 dark:text-foreground/80">
        {context.description}
      </p>
    </section>
  );
}

export function getWelcomeContext(events: EventItem[], now: number): WelcomeContext {
  const first = events[0];
  const last = events[events.length - 1];

  if (!first || !last) {
    return {
      eyebrow: "Paraty · Rio de Janeiro",
      title: "Bem-vindo, atleta.",
      description:
        "Programação, clima e informações úteis estarão aqui para você aproveitar Paraty com tranquilidade.",
    };
  }

  const firstStart = new Date(first.startsAt).getTime();
  const lastStart = new Date(last.startsAt).getTime();
  const lastEnd = last.endsAt
    ? new Date(last.endsAt).getTime()
    : lastStart + POINT_EVENT_WINDOW_MS;

  if (now < firstStart) {
    return {
      eyebrow: "",
      title: "Bem-vindo a Paraty. Pode respirar.",
      description:
        "Reunimos o que você precisa para se preparar, montar seu dia e viver o evento com mais calma.",
    };
  }

  if (now <= lastEnd) {
    return {
      eyebrow: "Evento acontecendo",
      title: "Você está no coração do Paraty Brazil by UTMB.",
      description:
        "Veja o que está acontecendo agora e o que vem a seguir. Os horários são sempre os de Paraty.",
    };
  }

  return {
    eyebrow: "Até a próxima",
    title: "Que experiência, atleta.",
    description:
      "Obrigado por viver Paraty com a gente. A programação continua disponível para você recordar esta edição.",
  };
}
