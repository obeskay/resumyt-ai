import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getDictionary } from "@/lib/getDictionary";
import { Locale, i18n } from "@/i18n-config";
import { getSupabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import SummaryDisplay from "@/components/SummaryDisplay";
import Head from "next/head";
import { NextSeo } from "next-seo";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";
import YouTubeThumbnail from "@/components/YouTubeThumbnail";
import dynamic from "next/dynamic";

const DynamicVideoChat = dynamic(
  () => import("@/components/custom/VideoChat"),
  {
    loading: () => <p>Cargando chat...</p>,
    ssr: false,
  },
);

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
}

interface SummaryFromDB {
  content: string;
  transcript: string;
  video_id: string;
  format: string;
  videos: Video[];
}

interface Summary {
  content: string;
  transcript: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  format: string;
}

interface SummaryPageProps {
  dict: any;
  initialSummaries: Summary[] | null;
}

interface Database {
  public: {
    Tables: {
      summaries: {
        Row: {
          id: number;
          video_id: string;
          title: string | null;
          content: string;
          transcript: string;
          format: string;
          created_at: string;
          user_id: string | null;
          suggested_questions: any | null;
        };
      };
      videos: {
        Row: {
          id: string;
          url: string;
          title: string | null;
          thumbnail_url: string | null;
          created_at: string;
          user_id: string | null;
        };
      };
    };
  };
}

export default function SummaryPage({
  dict,
  initialSummaries,
}: SummaryPageProps) {
  const router = useRouter();
  const { id, lang, format } = router.query;
  const [summaries, setSummaries] = useState<Summary[] | null>(
    initialSummaries,
  );
  const [selectedFormat, setSelectedFormat] = useState<string | undefined>(
    format as string | undefined,
  );
  const [isLoading, setIsLoading] = useState(!initialSummaries);

  useEffect(() => {
    if (!initialSummaries && id) {
      setIsLoading(true);
      fetch(`/api/getSummary?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          setSummaries(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching summaries:", error);
          setIsLoading(false);
        });
    }
  }, [id, initialSummaries]);

  const selectedSummary =
    summaries?.find((s) => s.format === selectedFormat) || summaries?.[0];

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
          url: `https://www.resumyt.com/${lang}/summary/${id}`,
          type: "article",
        }}
      />
      <BackgroundBeams />
      <div className="relative min-h-screen flex flex-col justify-center items-center w-full overflow-hidden z-[1]">
        <div className="container mx-auto py-8 relative z-10 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto sm:bg-background/90 sm:backdrop-blur-md sm:rounded-2xl sm:shadow-xl sm:overflow-hidden"
          >
            <header className="py-4 border-b border-border flex justify-between items-center px-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/${lang}`)}
                className="text-foreground hover:text-primary transition-colors"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                {dict.summary.backToHome}
              </Button>
              <h1 className="text-xl font-semibold text-primary hidden sm:block">
                {dict.summary.pageTitle}
              </h1>
            </header>

            {isLoading ? (
              <div className="space-y-4 sm:p-6">
                <Skeleton className="w-full h-48 mb-4" />
                <Skeleton className="w-3/4 h-8 mb-2" />
                <Skeleton className="w-1/2 h-6" />
              </div>
            ) : !selectedSummary ? (
              <div className="text-center text-foreground">
                <p className="text-xl">{dict.summary.notFound}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/${lang}`)}
                  className="mt-4"
                >
                  {dict.summary.returnHome}
                </Button>
              </div>
            ) : (
              <div className="sm:p-6 space-y-4">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-1/3">
                    <YouTubeThumbnail
                      src={`https://img.youtube.com/vi/${selectedSummary.videoId}/mqdefault.jpg`}
                      alt={selectedSummary.title || dict.summary.defaultTitle}
                      layoutId="video-thumbnail"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      <GradientText>
                        {selectedSummary.title || dict.summary.defaultTitle}
                      </GradientText>
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      <TextGenerateEffect
                        words={`${dict.summary.videoIdLabel}: ${selectedSummary.videoId}`}
                      />
                    </p>
                    <Button
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/watch?v=${selectedSummary.videoId}`,
                          "_blank",
                        )
                      }
                    >
                      {dict.summary.watchOnYoutube}
                    </Button>
                  </div>
                </div>

                {summaries && summaries.length > 1 && (
                  <div className="mb-4">
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      {summaries.map((summary) => (
                        <option key={summary.format} value={summary.format}>
                          {summary.format}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <AnimatePresence>
                  <motion.div
                    key={selectedFormat}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <SummaryDisplay summary={selectedSummary.content} />
                  </motion.div>
                </AnimatePresence>

                {/* Añadimos el DynamicVideoChat aquí */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-8 w-full max-w-3xl mx-auto"
                >
                  <DynamicVideoChat
                    videoId={selectedSummary.videoId}
                    videoTitle={
                      selectedSummary.title || dict.summary.defaultTitle
                    }
                    language={lang as "es" | "en"}
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
  console.log("Entrando a getServerSideProps de /summary/[id]");
  const lang = params?.lang as string;
  const id = params?.id as string;

  if (!lang || !id) {
    console.log("Missing lang or id:", { lang, id });
    return { notFound: true };
  }

  const validLang: Locale = i18n.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18n.defaultLocale;

  const dict = await getDictionary(validLang);

  const supabase = getSupabase();

  try {
    console.log("Fetching summaries for video ID:", id);
    const { data: summariesData, error } = await supabase
      .from("summaries")
      .select(
        `
        id,
        content,
        transcript,
        video_id,
        format,
        title,
        videos (
          id,
          thumbnail_url
        )
      `,
      )
      .eq("video_id", id);

    if (error) {
      console.error("Error fetching summaries:", error);
      return {
        props: {
          dict,
          initialSummaries: null,
        },
      };
    }

    const formattedSummaries = summariesData?.map((summary) => ({
      content: summary.content,
      transcript: summary.transcript,
      videoId: summary.video_id,
      title: summary.title || dict.summary.defaultTitle,
      thumbnailUrl: summary.videos?.[0]?.thumbnail_url || "",
      format: summary.format,
    }));

    return {
      props: {
        dict,
        initialSummaries: formattedSummaries || null,
      },
    };
  } catch (error) {
    console.error("Unexpected error in getServerSideProps:", error);
    return {
      props: {
        dict,
        initialSummaries: null,
      },
    };
  }
};
