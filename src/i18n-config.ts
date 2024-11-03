export type Locale = "en" | "es";

export const i18n = {
  defaultLocale: "en" as const,
  locales: ["en", "es"] as const,
};
