import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";
import { getSupabase } from "@/lib/supabase";
import SummaryDisplay from "@/components/SummaryDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import Head from "next/head";
import { NextSeo } from "next-seo";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ArrowLeftIcon,
  FileTextIcon,
  ClipboardIcon,
  YoutubeIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";
import YouTubeThumbnail from "@/components/YouTubeThumbnail";

interface SummaryPageProps {
  dict: any;
  initialSummary: {
    content: string;
    transcript: string;
    videoId: string;
    title: string;
    thumbnailUrl: string;
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
  const [activeTab, setActiveTab] = useState("summary");

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

  if (!dict || !dict.summary) {
    return <div>Cargando...</div>;
  }

  return (
    <MainLayout>
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
      <BackgroundBeams />
      <div className="relative min-h-screen flex flex-col justify-center items-center w-full overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-background/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <header className="py-6 px-6 sm:px-8 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-foreground hover:text-primary transition-colors"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                {dict.summary.backToHome}
              </Button>
            </header>

            {isLoading ? (
              <Skeleton className="w-full h-96" />
            ) : !summary ? (
              <div className="text-center p-8 text-foreground">
                <p className="text-xl">{dict.summary.notFound}</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {summary && summary.thumbnailUrl && (
                    <div className="max-w-sm w-full">
                      <YouTubeThumbnail
                        src={summary.thumbnailUrl}
                        alt={summary.title}
                        layoutId="video-thumbnail"
                      />
                    </div>
                  )}
                  <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-2">
                      <GradientText>{summary?.title}</GradientText>
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      <TextGenerateEffect
                        words={`${dict.summary.videoIdLabel}: ${summary?.videoId}`}
                      />
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-600 text-white border-red-600 hover:bg-red-700"
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/watch?v=${summary?.videoId}`,
                          "_blank",
                        )
                      }
                    >
                      <YoutubeIcon className="mr-2 h-4 w-4" />
                      {dict.summary.watchOnYoutube}
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant={activeTab === "summary" ? "default" : "outline"}
                    onClick={() => setActiveTab("summary")}
                    className="flex-1"
                  >
                    <ClipboardIcon className="w-4 h-4 mr-2" />
                    {dict.summary.summaryTab}
                  </Button>
                  <Button
                    variant={activeTab === "transcript" ? "default" : "outline"}
                    onClick={() => setActiveTab("transcript")}
                    className="flex-1"
                  >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    {dict.summary.transcriptTab}
                  </Button>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card p-6 rounded-xl shadow-inner"
                >
                  <SummaryDisplay
                    summary={
                      activeTab === "summary"
                        ? summary.content
                        : summary.transcript
                    }
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
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
    .select("content, transcript, video_id, title, thumbnail_url")
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
            title: summary.title,
            thumbnailUrl: summary.thumbnail_url,
          }
        : null,
    },
  };
};
