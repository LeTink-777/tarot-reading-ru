import type { Metadata } from "next";
import { ResultClient } from "@/components/ResultClient";

export const metadata: Metadata = {
  title: "Ваш расклад Таро",
  description: "Первая карта вашего персонального расклада Таро.",
  robots: { index: false, follow: false },
};

export default function ResultPage() {
  return <ResultClient />;
}
