import ClientHomePage from "@/components/ClientHomePage";
import { getDictionary } from "@/lib/dictionary";

export default async function HomePage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang);

  return <ClientHomePage dict={dict} />;
}
