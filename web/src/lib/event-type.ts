import type { EventType } from "./schedule";

export interface EventTypeStyle {
  label: string;
  /** Texto e ícone. */
  text: string;
  /** Fundo do chip/cartão. */
  chip: string;
  /** Chip quando o filtro está ativo. */
  chipActive: string;
  /** Barra lateral do cartão de evento. */
  bar: string;
}

export const EVENT_TYPE_STYLES: Record<EventType, EventTypeStyle> = {
  esporte: {
    label: "Esporte",
    text: "text-esporte dark:text-esporte-dark",
    chip: "bg-esporte/10 dark:bg-esporte-dark/10",
    chipActive: "bg-esporte text-white dark:bg-esporte-dark dark:text-utmb-navy",
    bar: "bg-esporte dark:bg-esporte-dark",
  },
  entretenimento: {
    label: "Entretenimento",
    text: "text-entretenimento dark:text-entretenimento-dark",
    chip: "bg-entretenimento/10 dark:bg-entretenimento-dark/10",
    chipActive: "bg-entretenimento text-white dark:bg-entretenimento-dark dark:text-utmb-navy",
    bar: "bg-entretenimento dark:bg-entretenimento-dark",
  },
  ativacao: {
    label: "Ativação",
    text: "text-ativacao dark:text-ativacao-dark",
    chip: "bg-ativacao/10 dark:bg-ativacao-dark/10",
    chipActive: "bg-ativacao text-white dark:bg-ativacao-dark dark:text-utmb-navy",
    bar: "bg-ativacao dark:bg-ativacao-dark",
  },
};

export const EVENT_TYPES: EventType[] = ["esporte", "entretenimento", "ativacao"];
