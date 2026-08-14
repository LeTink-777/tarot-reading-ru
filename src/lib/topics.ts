import type { TopicId } from "./tarot";

export type IconName =
  | "Heart"
  | "Briefcase"
  | "HelpCircle"
  | "Calendar"
  | "Users"
  | "Compass";

export interface Topic {
  id: TopicId;
  title: string;
  subtitle: string;
  icon: IconName;
}

export const TOPICS: Topic[] = [
  {
    id: "love",
    title: "Любовь и отношения",
    subtitle: "Что происходит между вами на самом деле",
    icon: "Heart",
  },
  {
    id: "career",
    title: "Карьера и деньги",
    subtitle: "Куда движется ваша профессиональная жизнь",
    icon: "Briefcase",
  },
  {
    id: "situation",
    title: "Конкретная ситуация",
    subtitle: "Ответ на один важный вопрос прямо сейчас",
    icon: "HelpCircle",
  },
  {
    id: "year",
    title: "Расклад на год",
    subtitle: "Что ждёт вас в каждом месяце 2026–2027",
    icon: "Calendar",
  },
  {
    id: "person",
    title: "Отношения с человеком",
    subtitle: "Его чувства, намерения и ваше будущее",
    icon: "Users",
  },
  {
    id: "path",
    title: "Жизненный путь",
    subtitle: "Куда вы идёте и что вас ждёт впереди",
    icon: "Compass",
  },
];

export function getTopic(id: string | null | undefined): Topic | undefined {
  return TOPICS.find((topic) => topic.id === id);
}
