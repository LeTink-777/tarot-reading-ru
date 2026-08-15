"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Headphones, Loader2, Mail } from "lucide-react";
import { PLANS, isPlanId } from "@/lib/plans";
import { readPendingOrder, readTarotData } from "@/lib/storage";
import { generateResultSections } from "@/lib/result-sections";
import { todayKey } from "@/lib/tarot";
import { useClientValue } from "@/lib/useClientValue";
import { CardBack } from "@/components/TarotCardVisual";
import { SiteFooter } from "@/components/SiteFooter";

const FAN = [
  { rotate: -16, x: -86, y: 18 },
  { rotate: 0, x: 0, y: 0 },
  { rotate: 16, x: 86, y: 18 },
];

export function ThankYouClient() {
  const params = useSearchParams();
  const data = useClientValue(readTarotData);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [storedPlan, setStoredPlan] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const order = readPendingOrder();
    if (order) {
      setPaymentId(order.paymentId);
      setStoredPlan(order.plan);
    }
  }, []);

  const planParam = params.get("plan");
  const planId = planParam ?? storedPlan;
  const plan = isPlanId(planId) ? PLANS[planId] : null;
  const hours = plan?.delivery ?? "24";
  const showUpsell = planId !== "premium" && planId !== "audio_upsell";

  // Тот же построитель, что использует PDF в письме — страница и вложение
  // всегда показывают одни и те же карты.
  const sections = useMemo(
    () =>
      data
        ? generateResultSections(
            { name: data.name, topic: data.topic, dateKey: todayKey() },
            planId
          )
        : [],
    [data, planId]
  );

  async function handleDownloadPDF() {
    if (!paymentId) {
      setDownloadError(
        "Не нашли номер платежа в этом браузере. Расклад отправлен вам на почту."
      );
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) throw new Error(`PDF request failed with ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "raskladtaro.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Немедленный revoke в некоторых браузерах отменяет загрузку.
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setDownloadError("Не удалось скачать PDF. Он также отправлен вам на почту.");
    } finally {
      setDownloading(false);
    }
  }

  async function addAudio() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "audio_upsell",
          userData: {
            name: data?.name ?? "",
            email: data?.email ?? "",
            topic: data?.topic ?? "",
          },
        }),
      });
      const payload = (await response.json()) as { confirmationUrl?: string; error?: string };
      if (!response.ok || !payload.confirmationUrl) {
        throw new Error(payload.error ?? "Не удалось создать платёж");
      }
      window.location.href = payload.confirmationUrl;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось создать платёж");
      setPending(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex flex-1 items-center overflow-hidden bg-bg-primary px-5 py-16">
        <div className="knot-field" aria-hidden />
        <div className="knot-glow" aria-hidden />

        <div className="relative mx-auto w-full max-w-2xl text-center">
          <OrnateCheckmark />

          <h1
            className="mt-8 text-accent-cream"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5.6vw, 36px)",
              lineHeight: 1.16,
            }}
          >
            Оплата прошла успешно!
          </h1>

          <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[16px] text-text-secondary">
            <Mail size={16} className="text-accent-gold" />
            {data?.name ? `${data.name}, ваш` : "Ваш"} расклад открыт ниже. Копия
            отправлена на {data?.email ? (
              <span className="text-accent-cream">{data.email}</span>
            ) : (
              "указанную почту"
            )}
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-accent-gold/60 bg-accent-gold/10 px-7 py-3.5 text-accent-cream transition-colors hover:border-accent-gold disabled:opacity-60"
            >
              <Download size={18} aria-hidden />
              {downloading ? "Готовим PDF…" : "Скачать PDF"}
            </button>

            {downloadError ? (
              <p className="mt-3 text-[14px] text-text-secondary" role="alert">
                {downloadError}
              </p>
            ) : null}
          </div>

          {sections.length > 0 ? (
            <section className="mt-12 text-left" aria-label="Ваш расклад">
              <ul className="grid gap-4">
                {sections.map((section) => (
                  <li
                    key={section.title}
                    className="rounded-xl border border-accent-gold/25 bg-bg-secondary p-6"
                  >
                    <h2 className="text-[15px] font-medium text-accent-gold">
                      {section.title}
                    </h2>
                    <p className="mt-2.5 text-[14px] leading-relaxed whitespace-pre-line text-text-secondary">
                      {section.content}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* -------------------------------------- ВЕЕР ИЗ КАРТ */}
          <div className="relative mx-auto mt-12 h-[190px] w-full max-w-sm sm:h-[230px]">
            {FAN.map((item, index) => (
              <motion.div
                key={index}
                className="absolute inset-x-0 top-0 flex justify-center"
                initial={{ opacity: 0, y: 40, rotate: 0, x: 0 }}
                animate={{ opacity: 1, y: item.y, rotate: item.rotate, x: item.x }}
                transition={{
                  delay: 0.25 + index * 0.18,
                  duration: 0.75,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <CardBack className="h-[176px] w-[112px] sm:h-[216px] sm:w-[138px]" />
              </motion.div>
            ))}
          </div>

          {/* ---------------------------------------------- АПСЕЛЛ */}
          {showUpsell ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="ornate mt-14 bg-bg-card px-5 py-7 sm:px-8"
            >
              <Headphones size={24} className="mx-auto text-accent-gold" />
              <h2
                className="mt-3 text-accent-cream"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(23px, 4.4vw, 29px)" }}
              >
                Хотите добавить голосовой разбор?
              </h2>
              <p className="mt-2 text-[15px] text-text-secondary">
                Только для новых клиентов — <span className="text-accent-gold-light">590 ₽</span>{" "}
                вместо <s className="text-text-muted">1 390 ₽</s>
              </p>

              <button
                type="button"
                onClick={addAudio}
                disabled={pending}
                className="btn-gold mt-6 w-full"
              >
                {pending ? <Loader2 size={18} className="animate-spin" /> : null}
                {pending ? "Переходим к оплате" : "Добавить аудио разбор"}
              </button>

              {error ? (
                <p role="alert" className="mt-4 text-[14px] text-accent-gold-light">
                  {error}
                </p>
              ) : null}
            </motion.div>
          ) : null}

          <Link
            href="/"
            className="mt-10 inline-block text-[14px] text-text-muted transition-colors hover:text-accent-gold"
          >
            Вернуться на главную
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/** Орнаментальная золотая галочка, нарисованная в SVG. */
function OrnateCheckmark() {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className="mx-auto w-[112px] sm:w-[132px]"
      fill="none"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <g stroke="var(--accent-gold)" strokeWidth="1.6" fill="none">
        <circle cx="60" cy="60" r="52" />
        <circle cx="60" cy="60" r="44" strokeWidth="0.9" />
        <path d="M60 8 L67 25 L60 20 L53 25 Z" fill="var(--accent-gold)" stroke="none" />
        <path d="M60 112 L67 95 L60 100 L53 95 Z" fill="var(--accent-gold)" stroke="none" />
        <path d="M8 60 L25 53 L20 60 L25 67 Z" fill="var(--accent-gold)" stroke="none" />
        <path d="M112 60 L95 53 L100 60 L95 67 Z" fill="var(--accent-gold)" stroke="none" />
      </g>
      <motion.path
        d="M38 61 L53 76 L83 45"
        stroke="var(--accent-gold-light)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
