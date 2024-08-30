import type { Locale } from "@/i18n-config";

// Definición del tipo Dictionary
export type Dictionary = {
  home: {
    title: string;
    subtitle: string;
    description: string;
    remainingQuota: string;
    inputPlaceholder: string;
    summarizeButton: string;
    error: {
      somethingWentWrong: string;
    };
    dialog: {
      title: string;
      description: string;
      button: string;
    };
    [key: string]: any; // Permite propiedades adicionales
  };
  summary: {
    title: string;
    loadingMessage: string;
    errorMessage: string;
    [key: string]: any; // Permite propiedades adicionales
  };
  auth: {
    signIn: string;
    signOut: string;
    [key: string]: any; // Permite propiedades adicionales
  };
  [key: string]: any; // Permite secciones adicionales
};

export const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default as Dictionary),
  es: () => import("@/dictionaries/es.json").then((module) => module.default as Dictionary),
  fr: () => import("@/dictionaries/fr.json").then((module) => module.default as Dictionary),
  de: () => import("@/dictionaries/de.json").then((module) => module.default as Dictionary),
  it: () => import("@/dictionaries/it.json").then((module) => module.default as Dictionary),
  pt: () => import("@/dictionaries/pt.json").then((module) => module.default as Dictionary),
  ru: () => import("@/dictionaries/ru.json").then((module) => module.default as Dictionary),
  zh: () => import("@/dictionaries/zh.json").then((module) => module.default as Dictionary),
};

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  if (locale in dictionaries) {
    return dictionaries[locale as Locale]();
  } else {
    console.warn(`Dictionary for locale ${locale} not found. Falling back to en.`);
    return dictionaries['en']();
  }
};