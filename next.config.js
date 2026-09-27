/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "json"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  i18n: {
    locales: ["en", "es", "fr", "de", "it", "pt", "ru", "zh"],
    defaultLocale: "es",
    localeDetection: false,
  },
};

module.exports = nextConfig;
