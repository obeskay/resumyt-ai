"use client";

import React, { useState, useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import VideoInput from "@/components/VideoInput";
import { getSupabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import RecentVideoThumbnails from "@/components/RecentVideoThumbnails";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  IconClipboard,
  IconBrain,
  IconRocket,
  IconUsers,
  IconYoutube,
  IconLightbulb,
  IconTrendingUp,
} from "@/components/ui/icons";
import Head from "next/head";
import { NextSeo } from "next-seo";
import { JsonLd } from "react-schemaorg";
import { FAQPage } from "schema-dts";
import ClientOnly from "./ClientOnly";
import { useRouter } from "next/router";
import { Locale } from "@/i18n-config";
import { initSmoothScroll } from "@/lib/smoothScroll";

type AnonymousUser = Database["public"]["Tables"]["anonymous_users"]["Row"];

interface ClientHomePageProps {
  dict: any;
  lang: Locale;
}

const ErrorFallback: React.FC<{
  error: Error;
  dict: ClientHomePageProps["dict"];
}> = ({ error, dict }) => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-red-600">
      {dict.home?.error?.somethingWentWrong ?? "Something went wrong"}
    </h1>
    <pre className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg overflow-auto">
      {error.message}
    </pre>
  </div>
);

/* eslint-disable react/display-name */
const ClientHomePage: React.FC<ClientHomePageProps> = ({ dict, lang }) => {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [recentVideos, setRecentVideos] = useState<string[]>([]);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoInputRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (
    url: string,
    formats: string[],
    videoTitle: string,
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/summarize?url=${url}&format=${formats.join(",")}&lang=${lang}&title=${encodeURIComponent(videoTitle)}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.videoId) {
        router.push(`/${lang}/summary/${data.videoId}`);
      } else {
        throw new Error("No se recibió un videoId válido");
      }
    } catch (error) {
      console.error("Error al resumir el video:", error);
      toast({
        title: "Error",
        description:
          "Hubo un problema al resumir el video. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const initializeUser = async (retries = 3) => {
      try {
        setLoading(true);
        const response = await fetch("/api/getIp");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { ip } = await response.json();
        const supabase = getSupabase();

        const { data: user, error } = await supabase
          .from("anonymous_users")
          .select("*")
          .eq("ip_address", ip)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            const { data: newUser, error: insertError } = await supabase
              .from("anonymous_users")
              .insert({ ip_address: ip })
              .select()
              .single();

            if (insertError)
              throw new Error(
                `Failed to create anonymous user: ${insertError.message}`,
              );
            setUser(newUser as AnonymousUser);
          } else {
            throw new Error(`Failed to fetch anonymous user: ${error.message}`);
          }
        } else {
          setUser(user as AnonymousUser);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        if (retries > 0) {
          console.log(
            `Retrying user initialization. Attempts left: ${retries - 1}`,
          );
          await initializeUser(retries - 1);
        } else {
          toast({
            title: "Error",
            description:
              "Failed to initialize user. Please refresh the page or try again later.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentVideos = async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("summaries")
        .select("video_id")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching recent videos:", error);
      } else {
        setRecentVideos(data.map((item) => item.video_id));
      }
    };

    initializeUser();
    fetchRecentVideos();
  }, [toast]);

  const features = [
    {
      icon: <IconClipboard className="h-12 w-12 text-primary" />,
      title: dict.home?.features?.quickSummaries ?? "Quick Summaries",
      description:
        dict.home?.features?.quickSummariesDesc ??
        "Get concise summaries of YouTube videos in seconds.",
    },
    {
      icon: <IconRocket className="h-12 w-12 text-primary" />,
      title: dict.home?.features?.timeSaving ?? "Time Saving",
      description:
        dict.home?.features?.timeSavingDesc ??
        "Save hours of watching time with our efficient summaries.",
    },
    {
      icon: <IconBrain className="h-12 w-12 text-primary" />,
      title: dict.home?.features?.acceleratedLearning ?? "Accelerated Learning",
      description:
        dict.home?.features?.acceleratedLearningDesc ??
        "Absorb information faster with our summarized content.",
    },
    {
      icon: <IconUsers className="h-12 w-12 text-primary" />,
      title: dict.home?.features?.forEveryone ?? "For Everyone",
      description:
        dict.home?.features?.forEveryoneDesc ??
        "Suitable for students, professionals, and curious minds alike.",
    },
    {
      icon: <IconYoutube className="h-12 w-12 text-primary" />,
      title: dict.home?.features?.diverseContent ?? "Diverse Content",
      description:
        dict.home?.features?.diverseContentDesc ??
        "Summarize a wide range of YouTube content, from lectures to documentaries.",
    },
    {
      icon: <IconLightbulb className="h-12 w-12 text-primary" />,
      title: dict.home?.features?.valuableInsights ?? "Valuable Insights",
      description:
        dict.home?.features?.valuableInsightsDesc ??
        "Extract key points and insights from any video.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: dict.home?.howItWorks?.step1 ?? "Paste the URL",
      description:
        dict.home?.howItWorks?.step1Desc ??
        "Simply copy and paste the URL of the YouTube video you want to summarize.",
    },
    {
      step: "2",
      title: dict.home?.howItWorks?.step2 ?? "Choose the format",
      description:
        dict.home?.howItWorks?.step2Desc ??
        "Select between key points, paragraph, or full page.",
    },
    {
      step: "3",
      title: dict.home?.howItWorks?.step3 ?? "Get your summary",
      description:
        dict.home?.howItWorks?.step3Desc ??
        "In seconds, receive a concise and accurate summary of the video content.",
    },
  ];

  const testimonials = [
    {
      quote:
        dict.home?.testimonials?.quote1 ??
        "Resumyt has saved me hours of time watching long videos. Now I can get the key information in minutes.",
      name: dict.home?.testimonials?.name1 ?? "Mary G.",
      title: dict.home?.testimonials?.title1 ?? "University student",
    },
    {
      quote:
        dict.home?.testimonials?.quote2 ??
        "Amazing for preparing presentations. Resumyt extracts the key points I need to create impactful content.",
      name: dict.home?.testimonials?.name2 ?? "James M.",
      title: dict.home?.testimonials?.title2 ?? "Marketing manager",
    },
    {
      quote:
        dict.home?.testimonials?.quote3 ??
        "Thanks to Resumyt, I can keep up with the latest programming tutorials without spending hours watching videos.",
      name: dict.home?.testimonials?.name3 ?? "Anna L.",
      title: dict.home?.testimonials?.title3 ?? "Software developer",
    },
    {
      quote:
        dict.home?.testimonials?.quote4 ??
        "Resumyt is an essential tool for anyone who wants to learn quickly. Now I can absorb information more efficiently.",
      name: dict.home?.testimonials?.name4 ?? "Charles V.",
      title: dict.home?.testimonials?.title4 ?? "University student",
    },
  ];

  const FeatureCard = React.memo(
    ({ feature, index }: { feature: any; index: number }) => (
      <motion.div
        className="p-6 rounded-3xl bg-card/30 backdrop-blur-md border border-px border-border/50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        {feature?.icon}
        <h3 className="text-xl font-semibold mb-2 mt-4">
          <TextGenerateEffect words={feature?.title} />
        </h3>
        <p className="text-muted-foreground">
          <TextGenerateEffect words={feature?.description} />
        </p>
      </motion.div>
    ),
  );

  const scrollToVideoInput = () => {
    if (videoInputRef.current) {
      const lenis = initSmoothScroll();
      lenis.scrollTo(videoInputRef.current);
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ErrorFallback error={error} dict={dict} />
      )}
    >
      <Head>
        <title>
          {dict.home?.title ?? "YouTube Video Summaries in Seconds"}
        </title>
        <meta
          name="description"
          content={
            dict.home?.metaDescription ??
            "Save time and learn faster with intelligent video summaries"
          }
        />
        <meta
          name="keywords"
          content={
            dict.home?.keywords ??
            "YouTube, summaries, video, summarization, learning, education, time-saving"
          }
        />
        <link rel="canonical" href={`https://www.resumyt.com/${lang}`} />
      </Head>
      <NextSeo
        title={dict.home?.title ?? "YouTube Video Summaries in Seconds"}
        description={
          dict.home?.metaDescription ??
          "Save time and learn faster with intelligent video summaries"
        }
        openGraph={{
          type: "website",
          locale: lang === "es" ? "es_ES" : "en_US",
          url: `https://www.resumyt.com/${lang}`,
          site_name: "Resumyt",
          title: dict.home?.title ?? "YouTube Video Summaries in Seconds",
          description:
            dict.home?.metaDescription ??
            "Save time and learn faster with intelligent video summaries",
          images: [
            {
              url: "https://www.resumyt.com/og-image.jpg",
              width: 1200,
              height: 630,
              alt: dict.home?.title ?? "YouTube Video Summaries in Seconds",
            },
          ],
        }}
        twitter={{
          handle: "@resumyt",
          site: "@resumyt",
          cardType: "summary_large_image",
        }}
      />
      <JsonLd<FAQPage>
        item={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: dict.home?.faq?.q1 ?? "What is Resumyt?",
              acceptedAnswer: {
                "@type": "Answer",
                text:
                  dict.home?.faq?.a1 ??
                  "Resumyt is a platform that provides concise and accurate summaries of YouTube videos in seconds.",
              },
            },
            {
              "@type": "Question",
              name: dict.home?.faq?.q2 ?? "How does Resumyt work?",
              acceptedAnswer: {
                "@type": "Answer",
                text:
                  dict.home?.faq?.a2 ??
                  "Resumyt uses advanced AI technology to analyze and summarize YouTube videos. It extracts key points, paragraphs, or full summaries based on your preferences.",
              },
            },
            {
              "@type": "Question",
              name: dict.home?.faq?.q3 ?? "Is Resumyt free to use?",
              acceptedAnswer: {
                "@type": "Answer",
                text:
                  dict.home?.faq?.a3 ??
                  "Yes, Resumyt offers a free tier with limited usage. For unlimited access and additional features, you can upgrade to a premium plan.",
              },
            },
            {
              "@type": "Question",
              name:
                dict.home?.faq?.q4 ??
                "Can I use Resumyt for educational purposes?",
              acceptedAnswer: {
                "@type": "Answer",
                text:
                  dict.home?.faq?.a4 ??
                  "Absolutely! Resumyt is an excellent tool for students, researchers, and educators to save time and learn faster from YouTube videos.",
              },
            },
          ],
        }}
      />
      <ClientOnly>
        <MainLayout>
          <div
            style={{
              maskImage:
                "radial-gradient(circle at center, transparent, black 150%)",
              WebkitMaskImage:
                "radial-gradient(circle at center, transparent, black 150%)",
            }}
            className="fixed w-full h-[50%] pointer-events-none z-[0] left-0 top-0 opacity-50 dark:opacity-80"
          >
            <RecentVideoThumbnails videoIds={recentVideos} dict={dict} />
          </div>
          <div className="relative min-h-screen flex flex-col justify-center items-center w-full overflow-hidden">
            <div ref={videoInputRef} className="container mx-auto">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-center space-y-12 py-20"
              >
                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl font-bold relative"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <GradientText>
                    {dict.home?.title ?? "YouTube Video Summaries in Seconds"}
                  </GradientText>
                </motion.h1>
                <motion.div
                  className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <TextGenerateEffect
                    words={
                      dict.home?.subtitle ??
                      "Save time and learn faster with intelligent video summaries"
                    }
                  />
                  <span className="hidden">
                    {dict.home?.metaDescription ??
                      "Save time and learn faster with intelligent video summaries"}
                  </span>
                </motion.div>

                {/* Video Input Section */}

                <motion.div
                  className="space-y-6 w-full max-w-3xl mx-auto relative"
                  key={user?.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <VideoInput
                    userId={user?.id || ""}
                    quotaRemaining={user?.quota_remaining || 0}
                    onSubmit={handleSubmit}
                    dict={dict}
                    lang={lang}
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    <TextGenerateEffect
                      words={`${dict.home?.remainingQuota ?? "Remaining quota"}: ${user?.quota_remaining || 0}`}
                    />
                  </p>
                </motion.div>
              </motion.div>

              {/* Features Section */}
              <motion.section
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {features.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} index={index} />
                ))}
              </motion.section>

              {/* How It Works Section */}
              <motion.section
                className="py-20"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-center mb-10">
                  <GradientText>
                    {dict.home?.howItWorks?.title ?? "How It Works"}
                  </GradientText>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {howItWorks.map((item, index) => (
                    <motion.div
                      key={index}
                      className="p-8 rounded-3xl bg-card/30 backdrop-blur-sm border border-px border-border/50"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="text-4xl font-bold text-primary mb-4">
                        {item.step}
                      </div>
                      <h3 className="text-2xl font-semibold mb-2">
                        <TextGenerateEffect words={item.title} />
                      </h3>
                      <p className="text-muted-foreground">
                        <TextGenerateEffect
                          words={item?.description
                            ?.split(" ")
                            .slice(0, 8)
                            .join(" ")}
                        />
                        <span className="hidden">
                          {item?.description?.split(" ").slice(8).join(" ")}
                        </span>
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Testimonials Section */}
              <motion.section
                className="py-20"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-center mb-10">
                  <GradientText>
                    {dict.home?.testimonials?.title ?? "Testimonials"}
                  </GradientText>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      className="p-6 rounded-3xl bg-card/30 backdrop-blur-md border border-px border-border/50"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <p className="text-lg mb-4 italic">
                        <TextGenerateEffect words={`"${testimonial?.quote}"`} />
                      </p>
                      <div className="font-semibold">
                        <TextGenerateEffect words={testimonial?.name} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <TextGenerateEffect words={testimonial.title} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* CTA Section */}
              <motion.section
                className="py-20 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-6">
                  <GradientText>
                    {dict.home?.cta?.title ?? "Ready to Get Started?"}
                  </GradientText>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  <TextGenerateEffect
                    words={
                      dict.home?.cta?.description ??
                      "Join thousands of satisfied users and start summarizing your videos today."
                    }
                  />
                </p>
                <Button
                  size="lg"
                  className="text-lg px-8 py-4"
                  onClick={scrollToVideoInput}
                >
                  {dict.home?.cta?.button ?? "Get Started"}
                </Button>
              </motion.section>

              {/* FAQ Section for SEO */}
              <motion.section
                className="py-20"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-center mb-10">
                  <GradientText>
                    <TextGenerateEffect
                      words={
                        dict.home?.faq?.title ?? "Frequently Asked Questions"
                      }
                    />
                  </GradientText>
                </h2>
                <div className="space-y-8 max-w-3xl mx-auto">
                  {[
                    {
                      q: dict.home?.faq?.q1 ?? "What is Resumyt?",
                      a:
                        dict.home?.faq?.a1 ??
                        "Resumyt is a platform that provides concise and accurate summaries of YouTube videos in seconds.",
                    },
                    {
                      q: dict.home?.faq?.q2 ?? "How does Resumyt work?",
                      a:
                        dict.home?.faq?.a2 ??
                        "Resumyt uses advanced AI technology to analyze and summarize YouTube videos. It extracts key points, paragraphs, or full summaries based on your preferences.",
                    },
                    {
                      q: dict.home?.faq?.q3 ?? "Is Resumyt free to use?",
                      a:
                        dict.home?.faq?.a3 ??
                        "Yes, Resumyt offers a free tier with limited usage. For unlimited access and additional features, you can upgrade to a premium plan.",
                    },
                    {
                      q:
                        dict.home?.faq?.q4 ??
                        "Can I use Resumyt for educational purposes?",
                      a:
                        dict.home?.faq?.a4 ??
                        "Absolutely! Resumyt is an excellent tool for students, researchers, and educators to save time and learn faster from YouTube videos.",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-card/30 p-6 rounded-3xl backdrop-blur-md border border-px border-border/50"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-xl font-semibold mb-2 w-full">
                        <TextGenerateEffect words={item.q} />
                      </h3>
                      <p className="text-muted-foreground w-full">
                        <TextGenerateEffect words={item.a} />
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>
          <Toaster />
        </MainLayout>
      </ClientOnly>
    </ErrorBoundary>
  );
};

ClientHomePage.displayName = "ClientHomePage";

export default ClientHomePage;
