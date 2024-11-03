import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import ClientHomePage from "@/components/ClientHomePage";
import { Locale } from "@/i18n-config";

interface HomePageProps {
  dict: any;
}

const HomePage: React.FC<HomePageProps> = ({ dict }) => {
  return <ClientHomePage dict={dict} lang={"es"} />;
};

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  res,
}) => {
  // Si no hay locale, redirigir a la página con el locale por defecto
  if (!locale) {
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
    },
  };
};

export default HomePage;
