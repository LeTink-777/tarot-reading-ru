"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { drawReading, type Reading } from "@/lib/tarot";
import { getTopic } from "@/lib/topics";
import { readTarotData, type TarotData } from "@/lib/storage";
import { useClientValue } from "@/lib/useClientValue";
import { TopicIcon } from "@/components/TopicIcon";
import { CardBack, FlipCard } from "@/components/TarotCardVisual";
import { QuizPricing } from "@/components/QuizPricing";
import { SiteFooter } from "@/components/SiteFooter";

/** Сколько рубашек показываем в закрытой части расклада. */
const MAX_LOCKED_PREVIEW = 5;

/** Обёртка нужна, чтобы отличить «ещё не читали» (null) от «данных нет». */
function readStored(): { data: TarotData | null } {
  return { data: readTarotData() };
}

export function ResultClient() {
  const router = useRouter();
  const stored = useClientValue(readStored);
  const data = stored?.data ?? null;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (stored && !stored.data) router.replace("/");
  }, [stored, router]);

  useEffect(() => {
    if (!data) return;
    const timer = window.setTimeout(() => setFlipped(true), 450);
    return () => window.clearTimeout(timer);
  }, [data]);

  const reading: Reading | null = useMemo(
    () => (data ? drawReading(data.name, data.topic) : null),
    [data],
  );

  if (!data || !reading) {
    return (
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-bg-primary px-5">
        <div className="knot-field" aria-hidden />
        <p className="relative text-[15px] text-text-secondary">Раскладываем карты…</p>
      </main>
    );
  }

  const topic = getTopic(data.topic);
  const [freeCard, ...lockedCards] = reading.cards;
  const lockedCount = lockedCards.length;
  const previewCount = Math.min(MAX_LOCKED_PREVIEW, lockedCount);

  return (
    <main className="flex-1">
      {/* ------------------------------------------------- ШАПКА */}
      <section className="relative overflow-hidden bg-bg-primary px-5 pb-14 pt-10">
        <div className="knot-field" aria-hidden />
        <div className="knot-glow" aria-hidden />

        <div className="relative mx-auto max-w-3xl text-center">
          <span
            className="text-accent-gold"
            style={{ fontFamily: "var(--font-gothic)", fontSize: 26 }}
          >
            ТАРО
          </span>

          <h1
            className="mt-5 text-accent-cream"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 6vw, 52px)",
              lineHeight: 1.12,
            }}
          >
            {data.name}, ваш расклад готов
          </h1>

          {topic ? (
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent-gold/50 bg-accent-gold/10 px-4 py-2 text-[14px] text-accent-gold-light">
              <TopicIcon name={topic.icon} size={16} />
              {topic.title}
            </span>
          ) : null}

          <p className="mx-auto mt-4 max-w-lg text-[15px] text-text-secondary">
            {reading.spreadName} — {reading.cards.length} карт из Старших Арканов
          </p>

          {/* --------------------------------------- БЕСПЛАТНАЯ КАРТА */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-11 flex flex-col items-center"
          >
            <FlipCard
              flipped={flipped}
              roman={freeCard.card.roman}
              name={freeCard.card.name}
              className="h-[310px] w-[196px] sm:h-[380px] sm:w-[240px]"
            />

            <span className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-text-muted">
              <Sparkles size={14} className="text-accent-gold" />
              Это ваша текущая ситуация
            </span>

            <h2
              className="mt-3 text-accent-gold-light"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5.4vw, 40px)" }}
            >
              {freeCard.card.roman} — {freeCard.card.name}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-text-primary">
              {freeCard.card.upright_meaning}
            </p>

            <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-text-secondary">
              {freeCard.context}
            </p>

            <p className="mx-auto mt-5 max-w-xl border-t border-border-tarot pt-5 text-[16px] italic leading-relaxed text-accent-cream">
              {freeCard.card.advice}
            </p>

            {data.question ? (
              <p className="mx-auto mt-6 max-w-xl rounded-lg border border-border-tarot bg-bg-card px-5 py-4 text-left text-[14px] text-text-secondary">
                <span className="text-text-muted">Ваш вопрос: </span>
                {data.question}
              </p>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------- ЗАКРЫТЫЕ КАРТЫ */}
      <section className="relative overflow-hidden border-t border-border-tarot bg-bg-primary px-5 py-14">
        <div className="knot-field" aria-hidden />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {Array.from({ length: previewCount }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="relative"
              >
                <CardBack
                  showQuestionMark
                  className="locked-blur h-[150px] w-[96px] sm:h-[190px] sm:w-[120px]"
                />
                <span className="absolute inset-0 z-20 flex items-center justify-center">
                  <Lock size={22} className="text-accent-gold-light drop-shadow" />
                </span>
              </motion.div>
            ))}
          </div>

          <h2
            className="mt-8 text-accent-cream"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 4.6vw, 36px)" }}
          >
            Остальные {lockedCount} карт вашего расклада
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-[16px] text-text-secondary">
            Полный расклад раскроет: {reading.benefits.join(", ")}.
          </p>

          <ul className="mx-auto mt-7 flex max-w-md flex-col gap-2 text-left">
            {lockedCards.slice(0, MAX_LOCKED_PREVIEW).map((item, index) => (
              <li
                key={item.position.title}
                className="flex items-center gap-3 rounded-lg border border-border-tarot bg-bg-card px-4 py-3"
              >
                <Lock size={15} className="shrink-0 text-accent-gold" />
                <span className="text-[15px] text-text-primary">{item.position.title}</span>
                <span className="ml-auto text-[13px] text-text-muted">
                  Карта {index + 2}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <QuizPricing data={data} />

      <SiteFooter />
    </main>
  );
}
