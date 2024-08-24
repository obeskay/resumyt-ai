import React from "react";
import { getDictionary } from "@/lib/getDictionary";
import ClientHomePage from "@/components/ClientHomePage";

interface HomePageProps {
  params: {
    lang: string;
  };
}

const HomePage: React.FC<HomePageProps> = async ({ params: { lang } }) => {
  const dict = await getDictionary(lang);

  return <ClientHomePage dict={dict} />;
};

export default HomePage;
