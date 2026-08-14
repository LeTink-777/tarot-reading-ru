"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Clock, Eye, Layers, Lock, Shield, Star } from "lucide-react";
import { TOPICS } from "@/lib/topics";
import type { TopicId } from "@/lib/tarot";
import { saveTarotData } from "@/lib/storage";
import { TopicIcon } from "@/components/TopicIcon";
import { CardBack, FlipCard } from "@/components/TarotCardVisual";

const STEPS = [
  {
    icon: Layers,
    title: "Карты тянутся для вас",
    text: "Система выбирает расклад под вашу тему",
  },
  {
    icon: Eye,
    title: "Первая карта открывается бесплатно",
    text: "Это ваша текущая ситуация",
  },
  {
    icon: Lock,
    title: "Остальные карты — в полном раскладе",
    text: "Который придёт на email",
  },
];

const QUOTES = [
  {
    text: "Расклад на отношения описал ситуацию точнее чем я ожидала. Была в шоке.",
    author: "Виктория, 29 лет",
  },
  {
    text: "Карьерный расклад дал понять что менять работу сейчас — правильное решение.",
    author: "Артём, 34 года",
  },
  {
    text: "Расклад на год стал моим планировщиком. Возвращаюсь к нему каждый месяц.",
    author: "Светлана, 41 год",
  },
];

const LOADING_CARDS = [
  { roman: "I", name: "Маг" },
  { roman: "XVII", name: "Звезда" },
  { roman: "XIX", name: "Солнце" },
];

export function Landing() {
  const router = useRouter();
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const formRef = useRef<HTMLDivElement | null>(null);

  const selectTopic = useCallback((id: TopicId) => {
    setTopic(id);
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 220);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timers = [
      window.setTimeout(() => setRevealed(1), 350),
      window.setTimeout(() => setRevealed(2), 1050),
      window.setTimeout(() => setRevealed(3), 1750),
      window.setTimeout(() => router.push("/result"), 2500),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [loading, router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topic) return;
    saveTarotData({
      name: name.trim(),
      email: email.trim(),
      topic,
      question: question.trim(),
    });
    setLoading(true);
  }

  return (
    <>
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-bg-primary px-5 pb-16 pt-8 sm:pt-10">
        <div className="knot-field" aria-hidden />
        <div className="knot-glow" aria-hidden />

        <div className="relative mx-auto max-w-5xl">
          <header className="flex flex-col items-center gap-1 text-center">
            <span
              className="text-accent-gold"
              style={{ fontFamily: "var(--font-gothic)", fontSize: 32, lineHeight: 1.2 }}
            >
              ТАРО
            </span>
            <span className="text-[13px] uppercase tracking-[0.28em] text-text-muted">
              Персональный расклад
            </span>
          </header>

          <FannedCards />

          <h1
            className="mx-auto mt-9 max-w-3xl text-center text-accent-cream"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(38px, 7vw, 66px)",
              lineHeight: 1.08,
              fontWeight: 500,
            }}
          >
            Карты уже знают
            <br />
            ответ на ваш вопрос
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-center text-[17px] text-text-secondary">
            Выберите тему — и получите расклад именно для вашей ситуации
          </p>

          {/* ------------------------------------------- ВЫБОР ТЕМЫ */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {TOPICS.map((item) => {
              const active = topic === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTopic(item.id)}
                  aria-pressed={active}
                  className={`group relative flex min-h-[132px] flex-col items-start gap-2 rounded-xl p-4 text-left transition-all duration-200 sm:min-h-[160px] sm:p-5 ${
                    active
                      ? "border-2 border-accent-gold bg-accent-gold/10 shadow-[0_0_28px_rgba(200,151,58,0.28)]"
                      : "border border-border-tarot bg-bg-card hover:-translate-y-0.5 hover:border-accent-gold hover:bg-bg-card-hover hover:shadow-[0_0_26px_rgba(200,151,58,0.22)] hover:scale-[1.02]"
                  }`}
                >
                  {active ? (
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent-gold">
                      <Check size={14} className="text-bg-primary" strokeWidth={3} />
                    </span>
                  ) : null}

                  <TopicIcon
                    name={item.icon}
                    size={24}
                    className={active ? "text-accent-gold-light" : "text-accent-gold"}
                  />
                  <span
                    className="text-accent-cream"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(17px, 2.2vw, 21px)",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </span>
                  <span className="text-[13px] leading-snug text-text-secondary">
                    {item.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ------------------------------------------------- ФОРМА */}
          <div ref={formRef}>
            <AnimatePresence>
              {topic ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 26, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -12, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 rounded-xl border border-border-tarot bg-bg-card p-5 sm:p-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label" htmlFor="name">
                          Имя
                        </label>
                        <input
                          id="name"
                          className="field"
                          type="text"
                          required
                          autoComplete="given-name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Как к вам обращаться"
                        />
                      </div>
                      <div>
                        <label className="label" htmlFor="email">
                          Email
                        </label>
                        <input
                          id="email"
                          className="field"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="Сюда придёт полный расклад"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="label" htmlFor="question">
                        Ваш вопрос
                      </label>
                      <textarea
                        id="question"
                        className="field resize-none"
                        rows={3}
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="Опишите ситуацию в двух словах — необязательно"
                      />
                    </div>

                    <button type="submit" className="btn-gold mt-5 w-full" disabled={loading}>
                      Открыть расклад
                      <ArrowRight size={18} />
                    </button>

                    <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-text-muted">
                      <li className="flex items-center gap-2">
                        <Shield size={14} /> Конфиденциально
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock size={14} /> Расклад готов мгновенно
                      </li>
                      <li className="flex items-center gap-2">
                        <Star size={14} /> 31 240 раскладов выполнено
                      </li>
                    </ul>
                  </div>
                </motion.form>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- КАК ЭТО РАБОТАЕТ */}
      <section className="relative overflow-hidden bg-bg-secondary px-5 py-16">
        <div className="knot-field" aria-hidden />
        <div className="relative mx-auto max-w-5xl">
          <h2
            className="text-center text-accent-cream"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)" }}
          >
            Как работает расклад
          </h2>
          <div className="divider-gold mx-auto mt-4 max-w-xs" />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-border-tarot bg-bg-card p-6 text-center"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent-gold/50 bg-accent-gold/10">
                  <Icon size={22} className="text-accent-gold" />
                </span>
                <h3
                  className="mt-4 text-accent-cream"
                  style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.25 }}
                >
                  {title}
                </h3>
                <p className="mt-2 text-[15px] text-text-secondary">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- ОТЗЫВЫ */}
      <section className="relative overflow-hidden bg-bg-primary px-5 py-16">
        <div className="knot-field" aria-hidden />
        <div className="relative mx-auto max-w-3xl">
          <h2
            className="text-center text-accent-cream"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)" }}
          >
            Что говорят о раскладах
          </h2>
          <div className="divider-gold mx-auto mt-4 max-w-xs" />

          <div className="mt-10 flex flex-col gap-8">
            {QUOTES.map((quote) => (
              <blockquote key={quote.author} className="quote">
                <p
                  className="text-accent-cream"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(19px, 2.6vw, 24px)",
                    lineHeight: 1.4,
                  }}
                >
                  {quote.text}
                </p>
                <footer className="mt-2 text-[14px] text-text-muted">— {quote.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------ ЭКРАН ЗАГРУЗКИ */}
      <AnimatePresence>
        {loading ? (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="knot-field" aria-hidden />
            <div className="relative flex gap-3 sm:gap-5">
              {LOADING_CARDS.map((card, index) => (
                <FlipCard
                  key={card.name}
                  flipped={revealed > index}
                  roman={card.roman}
                  name={card.name}
                  className="h-[190px] w-[120px] sm:h-[250px] sm:w-[158px]"
                />
              ))}
            </div>
            <p
              className="relative mt-8 text-center text-accent-cream"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 4vw, 30px)" }}
            >
              Карты раскладываются
            </p>
            <p className="relative mt-1 text-[14px] text-text-muted">Это займёт пару секунд</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/** Три рубашки веером — подпись героя. */
function FannedCards() {
  const layout = [
    { rotate: -14, x: -78, y: 16, z: 1 },
    { rotate: 0, x: 0, y: 0, z: 3 },
    { rotate: 14, x: 78, y: 16, z: 1 },
  ];

  return (
    <div className="relative mx-auto mt-9 h-[176px] w-full max-w-sm sm:h-[214px]">
      {layout.map((item, index) => (
        <motion.div
          key={index}
          className="absolute inset-x-0 top-0 flex justify-center"
          style={{ zIndex: item.z }}
          initial={{ opacity: 0, y: 34, rotate: 0, x: 0 }}
          animate={{ opacity: 1, y: item.y, rotate: item.rotate, x: item.x }}
          transition={{ delay: 0.15 + index * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <CardBack className="h-[164px] w-[104px] sm:h-[204px] sm:w-[130px]" />
        </motion.div>
      ))}
    </div>
  );
}
