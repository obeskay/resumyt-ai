export const i18n = {
  defaultLocale: 'es',
  locales: ['es', 'en'],
  localeDetection: false,
} as const;

export type Locale = (typeof i18n)['locales'][number];