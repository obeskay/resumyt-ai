import type { Locale } from "@/i18n-config";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  es: () => import("@/dictionaries/es.json").then((module) => module.default),
  // Agrega más idiomas según sea necesario
};

export const getDictionary = async (locale: string) => {
  if (locale in dictionaries) {
    return dictionaries[locale as keyof typeof dictionaries]();
  }
  return dictionaries.en(); // Fallback to English if the locale is not found
};