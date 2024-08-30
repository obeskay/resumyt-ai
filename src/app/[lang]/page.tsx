import ClientHomePage from "@/components/ClientHomePage";
import { getDictionary } from "@/lib/dictionary";
import { getQuickSummaries } from "@/lib/getQuickSummaries";
import { Locale } from "@/i18n-config";

export default async function Home({ params: { lang } }: { params: { lang: string } }) {
  const dict: any = await getDictionary(lang as Locale);
  
  let summaries = [];
  try {
    const quickSummariesResult:any = await getQuickSummaries(lang as Locale);
    summaries = quickSummariesResult?.summaries || [];
  } catch (error) {
    console.error("Error fetching quick summaries:", error);
    // Manejar el error según sea necesario
  }

  return (
    <ClientHomePage 
      dict={dict} 

    />
  );
}
