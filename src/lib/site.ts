/** Канонический адрес сайта: основной домен — с www. */
export const SITE_URL = "https://www.taro-online.online";

/** Домен без www — с него идёт редирект на канонический (см. next.config.ts). */
export const APEX_HOST = "taro-online.online";

/**
 * Хосты, на которые разрешено возвращать пользователя после оплаты ЮKassa.
 * Всё, чего здесь нет, откатывается на канонический SITE_URL — так подменённый
 * заголовок Host не сможет увести оплатившего человека на чужой домен.
 */
const ALLOWED_RETURN_HOSTS = new Set([
  APEX_HOST,
  "www.taro-online.online",
  "tarot-reading-ru.vercel.app",
  "localhost",
  "127.0.0.1",
]);

function isAllowedHost(hostname: string): boolean {
  if (ALLOWED_RETURN_HOSTS.has(hostname)) return true;
  // Превью-деплои Vercel: tarot-reading-ru-<hash>-<team>.vercel.app
  return hostname.endsWith(".vercel.app");
}

/** Базовый адрес без завершающего слэша, либо null если строка невалидна. */
function normalize(candidate: string | undefined): string | null {
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!isAllowedHost(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Базовый адрес для return_url ЮKassa: сначала NEXT_PUBLIC_SITE_URL,
 * затем origin запроса, и только потом канонический домен.
 */
export function resolveSiteUrl(request?: Request): string {
  return (
    normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalize(request?.url) ??
    SITE_URL
  );
}
