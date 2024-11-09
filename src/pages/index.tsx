import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import ClientHomePage from "@/components/ClientHomePage";
import { Locale } from "@/i18n-config";

interface HomePageProps {
  dict: any;
  locale: Locale;
}

const HomePage: React.FC<HomePageProps> = ({ dict, locale }) => {
  return <ClientHomePage dict={dict} lang={locale} />;
};

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  res,
}) => {
  // Si no hay locale o estamos en la ruta raíz sin locale, redirigir
  if (!locale || locale === "/") {
    return {
      redirect: {
        destination: "/es",
        permanent: false,
      },
    };
  }

  const dict = await getDictionary(locale as Locale);
  return {
    props: {
      dict,
      locale,
    },
  };
};

export default HomePage;
