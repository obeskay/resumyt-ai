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
  try {
    if (locale in dictionaries) {
      return dictionaries[locale as keyof typeof dictionaries] as Dictionary;
    } else {
      console.warn(`Dictionary for locale ${locale} not found. Falling back to en.`);
      return dictionaries.en as Dictionary;
    }
  } catch (error) {
    console.error(`Error loading dictionary for locale ${locale}:`, error);
    return dictionaries.en as Dictionary;
  }
};