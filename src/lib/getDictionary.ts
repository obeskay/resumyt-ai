import type { Locale } from "@/i18n-config";
import { dictionaries } from "./dictionary";

export const getDictionary = async (locale: string) => {
  if (locale in dictionaries) {
    return dictionaries[locale as Locale]();
  } else {
    console.warn(`Dictionary for locale ${locale} not found. Falling back to en.`);
    return dictionaries['en']();
  }
};