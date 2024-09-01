import type { Locale } from "@/i18n-config";

// Importa todos los diccionarios
import es from "@/dictionaries/es.json";
import en from "@/dictionaries/en.json";
// Importa otros idiomas según sea necesario

const dictionaries = {
  es,
  en,
  // Agrega otros idiomas aquí
};

export type Dictionary = typeof es; // Asumiendo que 'es' tiene todas las claves necesarias

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  if (locale in dictionaries) {
    return dictionaries[locale as keyof typeof dictionaries];
  } else {
    console.warn(`Dictionary for locale ${locale} not found. Falling back to en.`);
    return dictionaries.en;
  }
};