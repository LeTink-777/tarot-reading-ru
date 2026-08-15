import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
