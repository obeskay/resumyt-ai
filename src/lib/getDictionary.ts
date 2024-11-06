import type { Locale } from "@/i18n-config";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  es: () => import("@/dictionaries/es.json").then((module) => module.default),
  fr: () => import("@/dictionaries/fr.json").then((module) => module.default),
  de: () => import("@/dictionaries/de.json").then((module) => module.default),
  it: () => import("@/dictionaries/it.json").then((module) => module.default),
  pt: () => import("@/dictionaries/pt.json").then((module) => module.default),
  ru: () => import("@/dictionaries/ru.json").then((module) => module.default),
  zh: () => import("@/dictionaries/zh.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  try {
    const dictionary = await dictionaries[locale]?.();
    return validateAndFillMissingTranslations(
      dictionary,
      await dictionaries.en(),
    );
  } catch (error) {
    console.error(`Error loading dictionary for locale ${locale}:`, error);
    return dictionaries.en();
  }
};

function validateAndFillMissingTranslations(dictionary: any, fallback: any) {
  const result = { ...dictionary };

  function fillMissing(target: any, source: any) {
    for (const key in source) {
      if (!(key in target)) {
        target[key] = source[key];
      } else if (typeof source[key] === "object") {
        fillMissing(target[key], source[key]);
      }
    }
  }

  fillMissing(result, fallback);
  return result;
}
