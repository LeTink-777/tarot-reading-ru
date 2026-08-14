import type { TopicId } from "./tarot";

export const STORAGE_KEY = "tarot_data";
export const TIMER_KEY = "tarot_timer_start";
export const SPOTS_KEY = "tarot_spots";

export interface TarotData {
  name: string;
  email: string;
  topic: TopicId;
  question: string;
}

const VALID_TOPICS: TopicId[] = ["love", "career", "situation", "year", "person", "path"];

export function saveTarotData(data: TarotData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function readTarotData(): TarotData | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TarotData>;
    if (!parsed?.name || !parsed?.email) return null;
    if (!parsed.topic || !VALID_TOPICS.includes(parsed.topic)) return null;
    return {
      name: String(parsed.name),
      email: String(parsed.email),
      topic: parsed.topic,
      question: typeof parsed.question === "string" ? parsed.question : "",
    };
  } catch {
    return null;
  }
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

/** Начало 24-часового отсчёта, переживающее перезагрузку страницы. */
export function getTimerStart(): number {
  if (typeof window === "undefined") return Date.now();
  const raw = window.localStorage.getItem(TIMER_KEY);
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && Date.now() - parsed < TWENTY_FOUR_HOURS) {
    return parsed;
  }
  const now = Date.now();
  window.localStorage.setItem(TIMER_KEY, String(now));
  return now;
}

export function millisecondsLeft(startedAt: number): number {
  return Math.max(0, startedAt + TWENTY_FOUR_HOURS - Date.now());
}

interface SpotsState {
  count: number;
  updatedAt: number;
  /** Через сколько миллисекунд уменьшить счётчик в следующий раз */
  nextStepAfter: number;
}

const MIN_SPOTS = 2;
const MAX_SPOTS = 4;
const MIN_STEP_MS = 8 * 60 * 1000;
const MAX_STEP_MS = 12 * 60 * 1000;

function randomStep(): number {
  return MIN_STEP_MS + Math.floor(Math.random() * (MAX_STEP_MS - MIN_STEP_MS));
}

/**
 * Счётчик оставшихся мест: стартует с 4, каждые 8–12 минут уменьшается
 * на единицу и останавливается на 2. Состояние хранится в localStorage.
 */
export function readSpots(): number {
  if (typeof window === "undefined") return MAX_SPOTS;
  const raw = window.localStorage.getItem(SPOTS_KEY);
  const now = Date.now();

  let state: SpotsState = { count: MAX_SPOTS, updatedAt: now, nextStepAfter: randomStep() };
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<SpotsState>;
      if (
        typeof parsed.count === "number" &&
        typeof parsed.updatedAt === "number" &&
        typeof parsed.nextStepAfter === "number"
      ) {
        state = {
          count: Math.min(MAX_SPOTS, Math.max(MIN_SPOTS, Math.round(parsed.count))),
          updatedAt: parsed.updatedAt,
          nextStepAfter: parsed.nextStepAfter,
        };
      }
    } catch {
      // повреждённое значение — начинаем счётчик заново
    }
  }

  while (state.count > MIN_SPOTS && now - state.updatedAt >= state.nextStepAfter) {
    state = {
      count: state.count - 1,
      updatedAt: state.updatedAt + state.nextStepAfter,
      nextStepAfter: randomStep(),
    };
  }

  window.localStorage.setItem(SPOTS_KEY, JSON.stringify(state));
  return state.count;
}
