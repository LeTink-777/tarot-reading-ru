"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  ChevronDown,
  Headphones,
  Loader2,
  RotateCcw,
  Shield,
  Star,
  Users,
  Zap,
  type LucideProps,
} from "lucide-react";
import { ANSWER_TO_PLAN, PLANS, PLAN_ORDER, type PlanId, type QuizAnswer } from "@/lib/plans";
import { readSpots, type TarotData } from "@/lib/storage";
import { useClientValue } from "@/lib/useClientValue";
import { CountdownTimer } from "@/components/CountdownTimer";

const ANSWERS: { key: QuizAnswer; icon: React.ComponentType<LucideProps>; text: string }[] = [
  { key: "A", icon: Zap, text: "Получить ответ прямо сейчас — даже если кратко" },
  { key: "B", icon: BookOpen, text: "Понять ситуацию глубоко — со всеми картами и советами" },
  { key: "C", icon: Headphones, text: "Разобрать всё подробно — включая личный аудио разбор" },
];

interface QuizPricingProps {
  data: TarotData;
}

export function QuizPricing({ data }: QuizPricingProps) {
  const [answer, setAnswer] = useState<QuizAnswer | null>(null);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recommended = answer ? ANSWER_TO_PLAN[answer] : null;
  const others = recommended ? PLAN_ORDER.filter((id) => id !== recommended) : [];

  async function startCheckout(plan: PlanId) {
    setPending(plan);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          userData: { name: data.name, email: data.email, topic: data.topic },
        }),
      });
      const payload = (await response.json()) as { confirmationUrl?: string; error?: string };
      if (!response.ok || !payload.confirmationUrl) {
        throw new Error(payload.error ?? "Не удалось создать платёж");
      }
      window.location.href = payload.confirmationUrl;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось создать платёж");
      setPending(null);
    }
  }

  return (
    <section className="relative overflow-hidden bg-bg-secondary px-5 py-14">
      <div className="knot-field" aria-hidden />

      <div className="relative mx-auto max-w-3xl">
        {/* ------------------------------------------------ ШАГ 1 */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-center text-accent-cream"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4.6vw, 28px)" }}
          >
            Что для вас важнее в этом раскладе?
          </h2>
          <div className="divider-gold mx-auto mt-4 max-w-[200px]" />

          <div className="mt-7 flex flex-col gap-3">
            {ANSWERS.map(({ key, icon: Icon, text }) => {
              const active = answer === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAnswer(key)}
                  aria-pressed={active}
                  className={`flex min-h-[64px] w-full items-center gap-3 rounded-xl px-4 py-4 text-left text-[15px] transition-all duration-200 sm:px-5 sm:text-[16px] ${
                    active
                      ? "border-2 border-accent-gold bg-accent-gold/10 text-accent-cream"
                      : "border border-border-tarot bg-bg-card text-text-primary hover:border-accent-gold hover:bg-bg-card-hover"
                  }`}
                >
                  <Icon
                    size={18}
                    className={active ? "shrink-0 text-accent-gold-light" : "shrink-0 text-accent-gold"}
                  />
                  <span>{text}</span>
                  {active ? (
                    <Check size={18} className="ml-auto shrink-0 text-accent-gold" strokeWidth={3} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ------------------------------------------------ ШАГ 2 */}
        <AnimatePresence mode="wait">
          {recommended ? (
            <motion.div
              key={recommended}
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <RecommendedPlan
                planId={recommended}
                pending={pending}
                onSelect={startCheckout}
              />

              <p className="mt-6 flex items-center justify-center gap-2 text-[14px] text-text-muted">
                Или выбрать другой вариант
                <ChevronDown size={15} />
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {others.map((id) => (
                  <CompactPlan
                    key={id}
                    planId={id}
                    pending={pending}
                    onSelect={startCheckout}
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-accent-gold/40 bg-accent-gold/10 px-4 py-3 text-center text-[14px] text-accent-gold-light"
          >
            {error}
          </p>
        ) : null}

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[14px] text-text-muted">
          <li className="flex items-center gap-2">
            <Shield size={16} /> Безопасная оплата ЮKassa
          </li>
          <li className="flex items-center gap-2">
            <RotateCcw size={16} /> Возврат за 3 дня если не понравится
          </li>
          <li className="flex items-center gap-2">
            <Star size={16} /> 31 240 раскладов выполнено
          </li>
        </ul>
      </div>
    </section>
  );
}

interface PlanCardProps {
  planId: PlanId;
  pending: PlanId | null;
  onSelect: (plan: PlanId) => void;
}

function RecommendedPlan({ planId, pending, onSelect }: PlanCardProps) {
  const plan = PLANS[planId];
  const busy = pending === planId;

  return (
    <div className="ornate relative bg-bg-card px-5 py-7 sm:px-8 sm:py-9">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent-gold px-4 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-bg-primary">
        {plan.badge}
      </span>

      <h3
        className="mt-2 text-center text-accent-cream"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 5vw, 34px)" }}
      >
        {plan.name}
      </h3>

      <p className="mt-3 flex items-baseline justify-center gap-3">
        <s className="text-[19px] text-text-muted">{plan.oldPriceLabel}</s>
        <span
          className="text-accent-gold-light"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(38px, 8vw, 52px)", lineHeight: 1 }}
        >
          {plan.priceLabel}
        </span>
      </p>

      <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[15px] text-text-primary">
            <Check size={17} className="mt-1 shrink-0 text-accent-gold" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {planId === "full" ? (
        <div className="mx-auto mt-6 max-w-sm">
          <CountdownTimer />
        </div>
      ) : null}

      {planId === "premium" ? (
        <div className="mx-auto mt-6 max-w-sm">
          <SpotsCounter />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onSelect(planId)}
        disabled={busy}
        className={`btn-gold mt-6 w-full ${planId === "full" && !busy ? "pulse-gold" : ""}`}
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : null}
        {busy ? "Переходим к оплате" : plan.cta}
      </button>
    </div>
  );
}

function CompactPlan({ planId, pending, onSelect }: PlanCardProps) {
  const plan = PLANS[planId];
  const busy = pending === planId;

  return (
    <div className="flex flex-col rounded-xl border border-border-tarot bg-bg-card p-5">
      <h4
        className="text-accent-cream"
        style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.2 }}
      >
        {plan.name}
      </h4>

      <p className="mt-2 flex items-baseline gap-2">
        <s className="text-[14px] text-text-muted">{plan.oldPriceLabel}</s>
        <span className="text-[26px] font-bold text-accent-gold-light">{plan.priceLabel}</span>
      </p>

      <ul className="mt-3 flex flex-1 flex-col gap-1.5">
        {plan.features.slice(0, 3).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[13px] text-text-secondary">
            <Check size={14} className="mt-0.5 shrink-0 text-accent-gold" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(planId)}
        disabled={busy}
        className="btn-ghost mt-4 w-full text-[15px]"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
        {busy ? "Переходим к оплате" : `Выбрать за ${plan.priceLabel}`}
      </button>
    </div>
  );
}

/** Количество оставшихся мест на аудио разбор, состояние в localStorage. */
function SpotsCounter() {
  const spots = useClientValue(readSpots, 30_000);

  if (spots === null) return null;

  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-accent-gold/40 bg-accent-gold/10 px-4 py-2.5 text-[14px] text-text-secondary">
      <Users size={15} className="text-accent-gold-light" />
      Свободно мест на сегодня:
      <span className="text-[17px] font-bold text-accent-gold-light">{spots}</span>
    </div>
  );
}
