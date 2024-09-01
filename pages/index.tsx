import { GetServerSideProps } from 'next';
import { getDictionary } from "@/lib/getDictionary";
import ClientHomePage from '@/components/ClientHomePage';

interface HomePageProps {
  dict: any;
}

const HomePage: React.FC<HomePageProps> = ({ dict }) => {
  return <ClientHomePage dict={dict} />;
};

export const getServerSideProps: GetServerSideProps = async ({ locale, res }) => {
  // Si no hay locale, redirigir a la página con el locale por defecto
  if (!locale) {
    return {
      redirect: {
        destination: '/es',
        permanent: false,
      },
    };
  }

  const dict = await getDictionary(locale);
  return {
    props: {
      dict,
    },
  };
};

export default HomePage;