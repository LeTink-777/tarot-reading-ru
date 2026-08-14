import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-tarot bg-bg-secondary/50 px-5 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <p
            className="text-accent-gold"
            style={{ fontFamily: "var(--font-gothic)", fontSize: 24 }}
          >
            ТАРО
          </p>
          <p className="mt-1 text-[13px] text-text-muted">
            Евдокимов Даниил Владимирович. ИНН 381928138362. Самозанятый.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-text-secondary">
          <Link href="/privacy" className="transition-colors hover:text-accent-gold">
            Политика конфиденциальности
          </Link>
          <Link href="/offer" className="transition-colors hover:text-accent-gold">
            Публичная оферта
          </Link>
          <a
            href="mailto:danyavdkmvv3@gmail.com"
            className="transition-colors hover:text-accent-gold"
          >
            danyavdkmvv3@gmail.com
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-5xl text-[12px] leading-relaxed text-text-muted">
        Сервис предоставляется в развлекательных целях и не заменяет консультацию врача, юриста
        или финансового специалиста. Решения вы принимаете самостоятельно.
      </p>
    </footer>
  );
}
