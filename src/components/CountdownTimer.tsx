"use client";

import { Clock } from "lucide-react";
import { getTimerStart, millisecondsLeft } from "@/lib/storage";
import { useClientValue } from "@/lib/useClientValue";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Начало отсчёта берётся из localStorage, поэтому таймер переживает перезагрузку. */
function readMillisecondsLeft(): number {
  return millisecondsLeft(getTimerStart());
}

/** 24-часовой отсчёт до конца действия цены. */
export function CountdownTimer() {
  const left = useClientValue(readMillisecondsLeft, 1000);

  if (left === null) return null;

  const totalSeconds = Math.floor(left / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-accent-gold/40 bg-accent-gold/10 px-4 py-2.5 text-accent-gold-light">
      <Clock size={15} />
      <span className="text-[13px] uppercase tracking-[0.1em] text-text-secondary">
        Цена действует
      </span>
      <span
        className="tabular-nums text-[17px] font-bold"
        aria-label={`Осталось ${hours} часов ${minutes} минут`}
      >
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}
