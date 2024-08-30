import ClientHomePage from "@/components/ClientHomePage";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";

export default async function HomePage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  // Asegurarse de que lang es un Locale válido
  const validLang: Locale = i18n.locales.includes(lang as Locale) ? (lang as Locale) : i18n.defaultLocale;
  const dict = await getDictionary(validLang);

  return <ClientHomePage dict={dict} />;
}
