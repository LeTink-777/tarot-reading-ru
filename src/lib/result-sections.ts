import { drawReading, todayKey, type TopicId } from "@/lib/tarot";
import { isPlanId, type PlanId } from "@/lib/plans";
import type { PdfSection } from "@/lib/pdf-generator";

/**
 * Собирает разделы расклада для PDF в письме, PDF по кнопке и открытого
 * результата на /thank-you — чтобы все три источника совпадали.
 *
 * drawReading() детерминирован по связке имя + тема + дата, поэтому дата
 * фиксируется на момент оплаты и передаётся через metadata платежа. Иначе
 * покупатель, оплативший поздно вечером, получил бы в письме один расклад, а
 * на странице утром — другой.
 */

const VALID_TOPICS: TopicId[] = [
  "love",
  "career",
  "situation",
  "year",
  "person",
  "path",
];

function isTopicId(value: unknown): value is TopicId {
  return typeof value === "string" && VALID_TOPICS.includes(value as TopicId);
}

export type TarotInput = {
  name: string;
  topic: TopicId;
  /** Дата раздачи в формате YYYY-MM-DD, зафиксированная при оплате. */
  dateKey: string;
};

/**
 * Базовый тариф открывает первые три позиции расклада, полный и премиум —
 * весь расклад целиком.
 */
function cardCountForPlan(plan: PlanId, total: number): number {
  return plan === "situation" ? Math.min(3, total) : total;
}

export function generateResultSections(
  input: TarotInput,
  plan: string | null | undefined
): PdfSection[] {
  const resolvedPlan: PlanId = isPlanId(plan) ? plan : "full";
  const reading = drawReading(input.name, input.topic, input.dateKey);

  const shown = reading.cards.slice(
    0,
    cardCountForPlan(resolvedPlan, reading.cards.length)
  );

  return shown.map((drawn) => ({
    title: `${drawn.position.title} — ${drawn.card.roman}. ${drawn.card.name}`,
    content: [
      `${drawn.position.hint.charAt(0).toUpperCase()}${drawn.position.hint.slice(1)}.`,
      drawn.card.upright_meaning,
      drawn.context,
      `Совет: ${drawn.card.advice}`,
    ].join("\n\n"),
  }));
}

/** Читает данные расклада из metadata ЮKassa — там всё приходит строками. */
export function inputFromMetadata(
  metadata: Record<string, string>
): TarotInput | null {
  const name = metadata.name;
  const topic = metadata.topic;

  if (!name || !isTopicId(topic)) return null;

  return {
    name,
    topic,
    // Заказы, оформленные до появления этого поля, раздаются на сегодня.
    dateKey: metadata.dateKey || todayKey(),
  };
}

/** Строка под заголовком отчёта: имя и название расклада. */
export function buildSubtitle(input: TarotInput): string {
  const reading = drawReading(input.name, input.topic, input.dateKey);
  return `${input.name} · ${reading.spreadName}`;
}
