import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Генератор PDF читает эти шрифты с диска во время запроса. Их никто не
  // импортирует, поэтому трассировка файлов не увидит зависимость и роуты
  // уедут в деплой без шрифтов — вся кириллица превратится в мусор.
  outputFileTracingIncludes: {
    "/api/webhook": ["./public/fonts/**"],
    "/api/generate-pdf": ["./public/fonts/**"],
  },

  redirects() {
    return [
      // Апекс без www → канонический www.taro-online.online (308, с сохранением пути).
      {
        source: "/:path*",
        has: [{ type: "host", value: "taro-online.online" }],
        destination: "https://www.taro-online.online/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
