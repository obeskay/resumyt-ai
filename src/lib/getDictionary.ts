import 'server-only'

const dictionaries = {
  'en': () => import('../dictionaries/en.json').then((module) => module.default),
  'es': () => import('../dictionaries/es.json').then((module) => module.default),
  'fr': () => import('../dictionaries/fr.json').then((module) => module.default),
  'de': () => import('../dictionaries/de.json').then((module) => module.default),
  'it': () => import('../dictionaries/it.json').then((module) => module.default),
  'pt': () => import('../dictionaries/pt.json').then((module) => module.default),
  'ru': () => import('../dictionaries/ru.json').then((module) => module.default),
  'zh': () => import('../dictionaries/zh.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
  if (!dictionaries[locale]) {
    console.warn(`Dictionary for locale ${locale} not found. Falling back to en.`);
    locale = 'en';
  }
  return dictionaries[locale]();
}