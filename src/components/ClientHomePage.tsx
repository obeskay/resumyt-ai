"use client";

import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import VideoInput from "@/components/VideoInput";
import { getSupabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
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

type AnonymousUser = Database["public"]["Tables"]["anonymous_users"]["Row"];

interface ClientHomePageProps {
  dict: {
    home: {
      title: string;
      subtitle: string;
      remainingQuota: string;
      inputPlaceholder: string;
      summarizeButton: string;
      error: {
        somethingWentWrong: string;
        invalidUrl: string;
        quotaExceeded: string;
        noFormatSelected: string;
      };
      dialog: { title: string; description: string; button: string };
      metaDescription: string;
      keywords: string;
      features: {
        title: string;
        quickSummaries: string;
        timeSaving: string;
        acceleratedLearning: string;
        forEveryone: string;
        diverseContent: string;
        valuableInsights: string;
      };
      howItWorks: {
        title: string;
        step1: string;
        step2: string;
        step3: string;
      };
      testimonials: {
        title: string;
      };
      cta: {
        title: string;
        description: string;
        button: string;
      };
      faq: {
        title: string;
        q1: string;
        a1: string;
        q2: string;
        a2: string;
        q3: string;
        a3: string;
        q4: string;
        a4: string;
      };
    };
    recentVideos: {
      title: string;
      thumbnailAlt: string;
    };
    formats: {
      bulletPoints: string;
      paragraph: string;
      page: string;
    };
  };
}

const ErrorFallback: React.FC<{
  error: Error;
  dict: ClientHomePageProps["dict"];
}> = ({ error, dict }) => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-red-600">
      {dict.home.error.somethingWentWrong}
    </h1>
    <pre className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg overflow-auto">
      {error.message}
    </pre>
  </div>
);

const ClientHomePage: React.FC<ClientHomePageProps> = ({ dict }) => {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [recentVideos, setRecentVideos] = useState<string[]>([]);
  const router = useRouter();
  const handleSubmit = (url: string, format: string) => {
    fetch(`/api/summarize?url=${url}&format=${format}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.videoId) {
          router.push(`/${router.query.lang}/summary/${data.videoId}`);
        } else {
          throw new Error("No se recibió un videoId válido");
        }
      })
      .catch((error) => {
        console.error("Error al resumir el video:", error);
        toast({
          title: "Error",
          description:
            "Hubo un problema al resumir el video. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        });
      });
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
  }, []);

  const features = [
    {
      title: dict.home.features?.quickSummaries,
      description: "Obtén los puntos clave de cualquier video en segundos.",
      icon: <IconClipboard className="h-12 w-12 text-primary" />,
    },
    {
      title: dict.home.features?.timeSaving,
      description: "Consume contenido de forma eficiente y productiva.",
      icon: <IconRocket className="h-12 w-12 text-primary" />,
    },
    {
      title: dict.home.features?.acceleratedLearning,
      description: "Absorbe información más rápido que nunca.",
      icon: <IconBrain className="h-12 w-12 text-primary" />,
    },
    {
      title: dict.home.features?.forEveryone,
      description: "Perfecto para estudiantes, profesionales y curiosos.",
      icon: <IconUsers className="h-12 w-12 text-primary" />,
    },
    {
      title: dict.home.features?.diverseContent,
      description: "Funciona con una amplia variedad de videos de YouTube.",
      icon: <IconYoutube className="h-12 w-12 text-primary" />,
    },
    {
      title: dict.home.features?.valuableInsights,
      description: "Descubre ideas clave que podrías haber pasado por alto.",
      icon: <IconLightbulb className="h-12 w-12 text-primary" />,
    },
  ];

  const testimonials = [
    {
      quote:
        "Resumyt me ha ahorrado horas de tiempo viendo videos largos. Ahora puedo obtener la información clave en minutos.",
      name: "María G.",
      title: "Estudiante universitaria",
    },
    {
      quote:
        "Una herramienta indispensable para mi trabajo de investigación. Me ayuda a procesar grandes cantidades de contenido rápidamente.",
      name: "Carlos R.",
      title: "Investigador",
    },
    {
      quote:
        "Gracias a Resumyt, puedo mantenerme al día con los últimos tutoriales de programación sin perder horas viendo videos.",
      name: "Ana L.",
      title: "Desarrolladora de software",
    },
    {
      quote:
        "Increíble para preparar presentaciones. Resumyt extrae los puntos clave que necesito para crear contenido impactante.",
      name: "Javier M.",
      title: "Gerente de marketing",
    },
  ];

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ErrorFallback error={error} dict={dict} />
      )}
    >
      <Head>
        <title>{dict.home.title}</title>
        <meta name="description" content={dict.home.metaDescription} />
        <meta name="keywords" content={dict.home.keywords} />
        <link rel="canonical" href="https://www.resumyt.com/es" />
      </Head>
      <NextSeo
        title={dict.home?.title}
        description={dict.home?.metaDescription}
        openGraph={{
          type: "website",
          locale: "es_ES",
          url: "https://www.resumyt.com/es",
          site_name: "Resumyt",
          title: dict.home?.title,
          description: dict.home?.metaDescription,
          images: [
            {
              url: "https://www.resumyt.com/og-image.jpg",
              width: 1200,
              height: 630,
              alt: dict.home?.title,
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
              name: dict.home?.faq?.q1,
              acceptedAnswer: {
                "@type": "Answer",
                text: dict.home?.faq?.a1,
              },
            },
            {
              "@type": "Question",
              name: dict.home?.faq?.q2,
              acceptedAnswer: {
                "@type": "Answer",
                text: dict.home?.faq?.a2,
              },
            },
            {
              "@type": "Question",
              name: dict.home?.faq?.q3,
              acceptedAnswer: {
                "@type": "Answer",
                text: dict.home?.faq?.a3,
              },
            },
            {
              "@type": "Question",
              name: dict.home?.faq?.q4,
              acceptedAnswer: {
                "@type": "Answer",
                text: dict.home?.faq?.a4,
              },
            },
          ],
        }}
      />
      <ClientOnly>
        <BackgroundBeams />
        <MainLayout>
          <div
            style={{
              maskImage:
                "radial-gradient(circle at center, transparent, black 150%)",
              WebkitMaskImage:
                "radial-gradient(circle at center, transparent, black 150%)",
            }}
            className="fixed w-full h-[50%] pointer-events-none z-[0] left-0 top-0 opacity-40"
          >
            <RecentVideoThumbnails videoIds={recentVideos} dict={dict} />
          </div>
          <div className="relative min-h-screen flex flex-col justify-center items-center w-full overflow-hidden">
            <div className="container ">
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
                  <GradientText>{dict.home?.title}</GradientText>
                </motion.h1>
                <motion.div
                  className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <TextGenerateEffect words={dict.home?.subtitle} />
                  <span className="hidden">{dict.home?.metaDescription}</span>
                </motion.div>

                {/* Video Input Section */}

                <motion.div
                  className="space-y-6 w-full max-w-3xl mx-auto"
                  key={user?.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <VideoInput
                    userId={user?.id || ""}
                    isLoading={loading}
                    quotaRemaining={user?.quota_remaining || 0}
                    onSubmit={(url, format: any) => {
                      /* Implementar lógica de envío */
                      handleSubmit(url, format);
                    }}
                    dict={{
                      formats: dict.formats,
                      home: {
                        error: dict.home.error,
                        inputPlaceholder: dict.home.inputPlaceholder,
                        summarizeButton: dict.home.summarizeButton,
                      },
                    }}
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    <TextGenerateEffect
                      words={`${dict.home?.remainingQuota}: ${user?.quota_remaining || 0}`}
                    />
                  </p>
                </motion.div>
              </motion.div>

              {/* Features Section */}
              <motion.section
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="p-6 rounded-lg bg-background"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {feature?.icon}
                    <h3 className="text-xl font-semibold mb-2 mt-4">
                      <TextGenerateEffect words={feature?.title} />
                      <span className="hidden">{feature?.title}</span>
                    </h3>
                    <p className="text-muted-foreground">
                      <TextGenerateEffect words={feature?.description} />
                      <span className="hidden">{feature?.description}</span>
                    </p>
                  </motion.div>
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
                  <GradientText>{dict.home?.howItWorks?.title}</GradientText>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      step: "1",
                      title: dict.home?.howItWorks?.step1,
                      description:
                        "Simplemente copia y pega el URL del video de YouTube que quieres resumir.",
                    },
                    {
                      step: "2",
                      title: dict.home?.howItWorks?.step2,
                      description:
                        "Selecciona entre puntos claves, párrafo o página completa.",
                    },
                    {
                      step: "3",
                      title: dict.home?.howItWorks?.step3,
                      description:
                        "En segundos, recibe un resumen conciso y preciso del contenido del video.",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="p-8 rounded-lg bg-card"
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
                  <GradientText>{dict.home?.testimonials?.title}</GradientText>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      className="p-6 rounded-lg bg-card"
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
                  <GradientText>{dict.home?.cta?.title}</GradientText>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  <TextGenerateEffect words={dict.home?.cta?.description} />
                </p>
                <Button size="lg" className="text-lg px-8 py-4">
                  {dict.home?.cta?.button}
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
                    <TextGenerateEffect words={dict.home.faq.title} />
                  </GradientText>
                </h2>
                <div className="space-y-8 max-w-3xl mx-auto">
                  {[
                    { q: dict.home?.faq?.q1, a: dict.home?.faq?.a1 },
                    { q: dict.home?.faq?.q2, a: dict.home?.faq?.a2 },
                    { q: dict.home?.faq?.q3, a: dict.home?.faq?.a3 },
                    { q: dict.home?.faq?.q4, a: dict.home?.faq?.a4 },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-card p-6 rounded-lg"
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

export default ClientHomePage;
