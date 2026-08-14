/**
 * Три основных тарифа плюс апселл со страницы благодарности: аудио разбор
 * отдельно за 590 ₽ вместо 1 390 ₽ в составе премиума.
 */
export type PlanId = "situation" | "full" | "premium" | "audio_upsell";

export type QuizAnswer = "A" | "B" | "C";

export interface Plan {
  id: PlanId;
  name: string;
  /** Бейдж, который показывается, когда план рекомендован квизом */
  badge: string;
  oldPrice: number;
  price: number;
  /** Отформатированная цена для кнопок и текста */
  priceLabel: string;
  oldPriceLabel: string;
  features: string[];
  cta: string;
  delivery: string;
  /** Описание платежа для ЮKassa */
  description: string;
}

export const PLANS: Record<PlanId, Plan> = {
  situation: {
    id: "situation",
    name: "Расклад на ситуацию",
    badge: "РЕКОМЕНДУЕМ ДЛЯ ВАС",
    oldPrice: 890,
    price: 290,
    priceLabel: "290 ₽",
    oldPriceLabel: "890 ₽",
    features: [
      "Первые 3 карты расклада",
      "Краткий разбор ситуации",
      "PDF 5 страниц на email",
      "Готово за 24 часа",
    ],
    cta: "Получить расклад за 290 ₽",
    delivery: "24",
    description: "Расклад Таро на ситуацию",
  },
  full: {
    id: "full",
    name: "Полный расклад",
    badge: "ИМЕННО ТО ЧТО ВЫ ВЫБРАЛИ",
    oldPrice: 2490,
    price: 590,
    priceLabel: "590 ₽",
    oldPriceLabel: "2 490 ₽",
    features: [
      "Все карты расклада (7-12 карт)",
      "Глубокий разбор каждой карты",
      "Советы и рекомендации",
      "Прогноз на 3/6/12 месяцев (по теме)",
      "PDF 20+ страниц",
      "Готово за 12 часов",
    ],
    cta: "Получить полный расклад за 590 ₽",
    delivery: "12",
    description: "Полный расклад Таро",
  },
  premium: {
    id: "premium",
    name: "Расклад + Аудио",
    badge: "ВЫ ВЫБРАЛИ МАКСИМУМ",
    oldPrice: 4900,
    price: 1390,
    priceLabel: "1 390 ₽",
    oldPriceLabel: "4 900 ₽",
    features: [
      "Всё из полного расклада",
      "Персональный аудио разбор 15 минут",
      "Ответ на ваш личный вопрос",
      "PDF + аудиофайл",
      "Приоритет: готово за 6 часов",
    ],
    cta: "Получить расклад + аудио за 1 390 ₽",
    delivery: "6",
    description: "Расклад Таро + аудио разбор",
  },
  audio_upsell: {
    id: "audio_upsell",
    name: "Голосовой разбор",
    badge: "ТОЛЬКО ДЛЯ НОВЫХ КЛИЕНТОВ",
    oldPrice: 1390,
    price: 590,
    priceLabel: "590 ₽",
    oldPriceLabel: "1 390 ₽",
    features: [
      "Персональный аудио разбор 15 минут",
      "Ответ на ваш личный вопрос",
      "Аудиофайл на email",
    ],
    cta: "Добавить аудио разбор",
    delivery: "12",
    description: "Аудио разбор расклада Таро",
  },
};

/** Порядок трёх основных тарифов в квизе; апселл сюда не входит. */
export const PLAN_ORDER: PlanId[] = ["situation", "full", "premium"];

export const ANSWER_TO_PLAN: Record<QuizAnswer, PlanId> = {
  A: "situation",
  B: "full",
  C: "premium",
};

export function isPlanId(value: unknown): value is PlanId {
  return (
    value === "situation" ||
    value === "full" ||
    value === "premium" ||
    value === "audio_upsell"
  );
}
