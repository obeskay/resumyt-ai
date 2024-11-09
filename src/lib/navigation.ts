import { Locale } from "@/i18n-config";

export const getLocalizedPath = (
  path: string,
  locale: Locale | string = "es",
) => {
  // Remover cualquier locale existente del path
  const cleanPath = path.replace(/^\/[a-z]{2}(?=\/|$)/, "");

  // Construir el nuevo path con el locale
  return `/${locale}${cleanPath}`;
};
