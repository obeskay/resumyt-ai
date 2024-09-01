import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";
import { getSupabase } from "@/lib/supabase";
import SummaryDisplay from "@/components/SummaryDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import Head from "next/head";
import { NextSeo } from "next-seo";
import MainLayout from "@/components/MainLayout";
import { IconClipboard } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { FileTextIcon } from "lucide-react";

interface SummaryPageProps {
  dict: any;
  initialSummary: {
    content: string;
    transcript: string;
    videoId: string;
  } | null;
}

export default function SummaryPage({
  dict,
  initialSummary,
}: SummaryPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const [summary, setSummary] = useState(initialSummary);
  const [isLoading, setIsLoading] = useState(!initialSummary);

  useEffect(() => {
    if (!initialSummary && id) {
      setIsLoading(true);
      fetch(`/api/getSummary?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          setSummary(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching summary:", error);
          setIsLoading(false);
        });
    }
  }, [id, initialSummary]);

  return (
    <>
      <Head>
        <title>{dict.summary.title}</title>
        <meta name="description" content={dict.summary.metaDescription} />
      </Head>
      <NextSeo
        title={dict.summary.title}
        description={dict.summary.metaDescription}
        openGraph={{
          title: dict.summary.title,
          description: dict.summary.metaDescription,
          url: `https://www.resumyt.com/${router.query.lang}/summary/${router.query.id}`,
          type: "article",
        }}
      />
      <MainLayout>
        <BackgroundBeams />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              <GradientText>
                <TextGenerateEffect words={dict.summary.title} />
              </GradientText>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <TextGenerateEffect words={dict.summary.subtitle} />
            </p>
          </motion.div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Skeleton className="w-full h-96 rounded-lg" />
            </motion.div>
          ) : !summary ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xl text-muted-foreground"
            >
              {dict.summary.notFound}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-card rounded-lg shadow-lg p-6"
            >
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="w-full justify-center mb-6">
                  <TabsTrigger value="summary" className="text-lg px-6 py-3">
                    <IconClipboard className="w-5 h-5 mr-2" />
                    {dict.summary.summaryTab}
                  </TabsTrigger>
                  <TabsTrigger value="transcript" className="text-lg px-6 py-3">
                    <FileTextIcon className="w-5 h-5 mr-2" />
                    {dict.summary.transcriptTab}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="summary">
                  <SummaryDisplay summary={summary.content} />
                </TabsContent>
                <TabsContent value="transcript">
                  <SummaryDisplay summary={summary.transcript} />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <Button
              size="lg"
              onClick={() => router.push("/")}
              className="text-lg px-8 py-4"
            >
              {dict.summary.backToHome}
            </Button>
          </motion.div>
        </div>
      </MainLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  locale,
}) => {
  const lang = params?.lang as string;
  const id = params?.id as string;
  const validLang: Locale = i18n.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18n.defaultLocale;
  const dict = await getDictionary(validLang);

  const supabase = getSupabase();
  const { data: summary, error } = await supabase
    .from("summaries")
    .select("content, transcript, video_id")
    .eq("video_id", id)
    .single();

  if (error) {
    console.error("Error fetching summary:", error);
    return {
      props: {
        dict,
        initialSummary: null,
      },
    };
  }

  return {
    props: {
      dict,
      initialSummary: summary
        ? {
            content: summary.content,
            transcript: summary.transcript,
            videoId: summary.video_id,
          }
        : null,
    },
  };
};
