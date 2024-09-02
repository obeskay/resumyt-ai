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
import { ArrowLeftIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const { id, lang } = router.query; // Asegúrate de obtener tanto 'id' como 'lang'
  const [summary, setSummary] = useState(initialSummary);
  const [isLoading, setIsLoading] = useState(!initialSummary);

  useEffect(() => {
    if (!initialSummary && id) {
      setIsLoading(true);
      fetch(`/api/getSummary?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          setSummary({
            content: data.content,
            transcript: data.transcript,
            videoId: data.videoId,
            title: data.title,
            thumbnailUrl: data.thumbnailUrl,
          });
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
      <AnimatePresence>
        {summary?.videoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed w-screen h-screen inset-0 bg-cover bg-center z-[0] pointer-events-none"
          >
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-cover bg-center blur-sm"
              style={{
                backgroundImage: `url(https://img.youtube.com/vi/${summary?.videoId}/mqdefault.jpg)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
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
      <div className="relative min-h-screen flex flex-col justify-center items-center w-full overflow-hidden z-[1]">
        <div className="container mx-auto py-8 relative z-10 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl mx-auto sm:bg-background/90 sm:backdrop-blur-md sm:rounded-2xl sm:shadow-xl sm:overflow-hidden"
          >
            <header className="py-4 border-b border-border flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
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
              <div className="space-y-4">
                <Skeleton className="w-full h-64 mb-4" />
                <Skeleton className="w-3/4 h-8 mb-2" />
                <Skeleton className="w-1/2 h-6" />
              </div>
            ) : !summary ? (
              <>
                <div className="text-center text-foreground">
                  <p className="text-xl">{dict.summary.notFound}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/")}
                    className="mt-4"
                  >
                    {dict.summary.returnHome}
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-6 mb-6">
                  {summary.videoId && (
                    <div className="w-full lg:w-1/3 relative group">
                      <YouTubeThumbnail
                        src={`https://img.youtube.com/vi/${summary.videoId}/mqdefault.jpg`}
                        alt={summary.title}
                        layoutId="video-thumbnail"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      <GradientText>{summary.title}</GradientText>
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      <TextGenerateEffect
                        words={`${dict.summary.videoIdLabel}: ${summary.videoId}`}
                      />
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-600 text-white border-red-600 hover:bg-red-700 transition-colors duration-300"
                      onClick={() =>
                        window.open(
                          `https://www.youtube.com/watch?v=${summary.videoId}`,
                          "_blank",
                        )
                      }
                    >
                      {dict.summary.watchOnYoutube}
                    </Button>
                  </div>
                </div>

                <SummaryDisplay
                  summary={summary.content}
                  className="text-lg leading-relaxed gap-y-8 flex flex-col"
                />
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
    console.log("Fetching summary for video ID:", id);
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
  } catch (error) {
    console.error("Unexpected error in getServerSideProps:", error);
    return {
      props: {
        dict,
        initialSummary: null,
      },
    };
  }
};
