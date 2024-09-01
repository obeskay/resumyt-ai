import ClientHomePage from "@/components/ClientHomePage";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";
import { GetServerSideProps } from "next";

export default function HomePage({ dict, lang }: { dict: any; lang: Locale }) {
  return <ClientHomePage dict={dict} lang={lang} />;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const lang = params?.lang as string;
  const validLang: Locale = i18n.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18n.defaultLocale;
  const dict = await getDictionary(validLang);

  return {
    props: { dict, lang: validLang },
  };
};
