export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh'],
} as const;

export type Locale = (typeof i18n)['locales'][number];