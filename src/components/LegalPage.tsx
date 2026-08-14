import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

interface LegalPageProps {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}

export function LegalPage({ title, updatedAt, sections }: LegalPageProps) {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-bg-primary px-5 py-12">
        <div className="knot-field" aria-hidden />

        <article className="relative mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] text-text-muted transition-colors hover:text-accent-gold"
          >
            <ArrowLeft size={15} />
            На главную
          </Link>

          <h1
            className="mt-7 text-accent-cream"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(30px, 5.4vw, 44px)",
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>
          <p className="mt-2 text-[14px] text-text-muted">Редакция от {updatedAt}</p>
          <div className="divider-gold mt-6" />

          <div className="mt-9 flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2
                  className="text-accent-gold-light"
                  style={{ fontFamily: "var(--font-display)", fontSize: 24, lineHeight: 1.25 }}
                >
                  {section.heading}
                </h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-[16px] leading-relaxed text-text-secondary">
                    {paragraph}
                  </p>
                ))}

                {section.bullets ? (
                  <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[16px] leading-relaxed text-text-secondary marker:text-accent-gold">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
