"use client";

import { Lock } from "lucide-react";

interface CardBackProps {
  className?: string;
  /** Золотой знак вопроса поверх рубашки */
  showQuestionMark?: boolean;
  showLock?: boolean;
}

/** Рубашка карты: кельтский узор в золотой рамке, нарисованной на CSS. */
export function CardBack({ className = "", showQuestionMark, showLock }: CardBackProps) {
  return (
    <div className={`ornate card-back relative overflow-hidden ${className}`}>
      {showQuestionMark ? (
        <span
          className="absolute inset-0 z-10 flex items-center justify-center text-accent-gold-light/80"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(38px, 9vw, 64px)" }}
          aria-hidden
        >
          ?
        </span>
      ) : null}
      {showLock ? (
        <span className="absolute inset-0 z-10 flex items-center justify-center">
          <Lock size={26} className="text-accent-gold-light" />
        </span>
      ) : null}
    </div>
  );
}

interface CardFaceProps {
  roman: string;
  name: string;
  className?: string;
}

/** Лицевая сторона: римская нумерация, название аркана и орнамент. */
export function CardFace({ roman, name, className = "" }: CardFaceProps) {
  return (
    <div
      className={`ornate card-face relative flex flex-col items-center justify-between overflow-hidden px-4 py-6 text-center ${className}`}
    >
      <span
        className="text-accent-gold-light"
        style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: "0.16em" }}
      >
        {roman}
      </span>

      <ArcanaEmblem />

      <span
        className="text-accent-cream leading-tight"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(17px, 4.4vw, 24px)" }}
      >
        {name}
      </span>
    </div>
  );
}

/** Эмблема аркана — звезда и лучи, нарисованные в SVG. */
function ArcanaEmblem() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="my-2 w-[52%] max-w-[120px]"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <g className="text-accent-gold" strokeWidth="1.4">
        <circle cx="50" cy="50" r="34" />
        <circle cx="50" cy="50" r="27" strokeWidth="0.8" />
        <path d="M50 16 L58 42 L84 50 L58 58 L50 84 L42 58 L16 50 L42 42 Z" />
        <path d="M50 23 L50 77 M23 50 L77 50" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

interface FlipCardProps {
  flipped: boolean;
  roman: string;
  name: string;
  className?: string;
}

/** Карта с 3D-переворотом рубашки на лицевую сторону. */
export function FlipCard({ flipped, roman, name, className = "" }: FlipCardProps) {
  return (
    <div className={`flip-scene ${className}`}>
      <div className={`flip-inner ${flipped ? "is-flipped" : ""}`}>
        <div className="flip-face">
          <CardBack className="h-full w-full" />
        </div>
        <div className="flip-face flip-face--back">
          <CardFace roman={roman} name={name} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
