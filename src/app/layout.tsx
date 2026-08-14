import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Lato,
  PT_Sans,
  Ruslan_Display,
  UnifrakturMaguntia,
} from "next/font/google";
import "./globals.css";

/* UnifrakturMaguntia не содержит кириллицы. Автоматический метрический
   фолбэк отключён намеренно: иначе локальный Times перехватывал бы русские
   буквы раньше, чем до них дошла бы кириллическая готика Ruslan Display. */
const unifraktur = UnifrakturMaguntia({
  variable: "--font-unifraktur",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  adjustFontFallback: false,
  fallback: [],
});

/* Кириллическая часть логотипа и заголовков готическим начертанием. */
const ruslan = Ruslan_Display({
  variable: "--font-ruslan",
  subsets: ["cyrillic", "latin"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* Lato тоже без кириллицы — фолбэк отключён по той же причине, что и выше. */
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  adjustFontFallback: false,
  fallback: [],
});

/* PT Sans закрывает весь русский текст интерфейса и несёт метрический фолбэк. */
const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tarot-reading-ru.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Расклад Таро онлайн — Бесплатная карта на вашу ситуацию",
  description:
    "Персональный расклад Таро на любую ситуацию: любовь, карьера, отношения, год. Первая карта бесплатно — результат мгновенно. Более 31 000 раскладов.",
  keywords: [
    "расклад таро",
    "таро онлайн",
    "расклад таро онлайн",
    "таро бесплатно",
    "расклад таро бесплатно",
    "таро на ситуацию",
    "таро на любовь",
    "таро на карьеру",
    "таро на год",
    "таро на отношения",
    "расклад таро на год",
    "онлайн таро расклад бесплатно",
    "таро расклад на вопрос",
    "карты таро онлайн",
    "таро гадание онлайн",
    "таро расклад на будущее",
    "таро расклад на человека",
    "таро расклад три карты",
    "старшие арканы таро",
    "таро расклад 2026",
  ],
  authors: [{ name: "Евдокимов Даниил Владимирович" }],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    apple: { url: "/favicon.svg" },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Расклад Таро онлайн",
    title: "Расклад Таро онлайн — Бесплатная карта на вашу ситуацию",
    description:
      "Персональный расклад Таро на любую ситуацию: любовь, карьера, отношения, год. Первая карта бесплатно — результат мгновенно.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Расклад Таро онлайн — Бесплатная карта на вашу ситуацию",
    description:
      "Персональный расклад Таро: любовь, карьера, отношения, год. Первая карта бесплатно.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport = {
  themeColor: "#1A0A0A",
  width: "device-width",
  initialScale: 1,
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Расклад Таро онлайн",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Персональный расклад Таро на любую ситуацию: любовь, карьера, отношения, год. Первая карта бесплатно.",
  offers: [
    {
      "@type": "Offer",
      name: "Расклад Таро на ситуацию",
      price: "290",
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Полный расклад Таро",
      price: "590",
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Расклад Таро + аудио разбор",
      price: "1390",
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "31240",
    bestRating: "5",
    worstRating: "1",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Как работает онлайн расклад Таро?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Система выбирает карты на основе вашей темы и имени. Первая карта открывается бесплатно — это ваша текущая ситуация. Полный расклад из 7-12 карт приходит на email в PDF.",
      },
    },
    {
      "@type": "Question",
      name: "Таро онлайн — это точно?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Карты Таро отражают текущие энергии и тенденции. Многие находят расклады удивительно точными — особенно в описании текущей ситуации и внутренних конфликтов.",
      },
    },
    {
      "@type": "Question",
      name: "На какие темы можно сделать расклад?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Доступны 6 тем: любовь и отношения, карьера и деньги, конкретная ситуация, расклад на год, отношения с конкретным человеком, жизненный путь.",
      },
    },
    {
      "@type": "Question",
      name: "Как быстро придёт расклад?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Базовый расклад — в течение 24 часов. Полный — 12 часов. Расклад с аудио — приоритетно за 6 часов.",
      },
    },
    {
      "@type": "Question",
      name: "Что такое Старшие Арканы?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Старшие Арканы — 22 главные карты колоды Таро от Шута до Мира. Они отражают ключевые жизненные темы и принципиальные моменты судьбы.",
      },
    },
  ],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Расклад Таро онлайн",
  url: SITE_URL,
  inLanguage: "ru-RU",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${unifraktur.variable} ${ruslan.variable} ${cormorant.variable} ${lato.variable} ${ptSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </body>
    </html>
  );
}
