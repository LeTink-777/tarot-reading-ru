import { Suspense } from "react";
import type { Metadata } from "next";
import { ThankYouClient } from "@/components/ThankYouClient";

export const metadata: Metadata = {
  title: "Расклад принят в работу",
  description: "Ваш расклад Таро уже готовится.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-bg-primary px-5">
          <div className="knot-field" aria-hidden />
          <p className="relative text-[15px] text-text-secondary">Готовим ваш расклад…</p>
        </main>
      }
    >
      <ThankYouClient />
    </Suspense>
  );
}
