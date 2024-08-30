"use client";

import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import VideoInput from "@/components/VideoInput";
import { getSupabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CardStack } from "@/components/ui/card-stack";
import { BackgroundBeams } from "@/components/ui/background-beams";
import RecentVideoThumbnails from "@/components/RecentVideoThumbnails";
import { GradientText } from "@/components/ui/gradient-text";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { SparklesCore } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import MultiStepForm from "@/components/MultiStepForm";

type AnonymousUser = Database["public"]["Tables"]["anonymous_users"]["Row"];

interface ClientHomePageProps {
  dict: {
    home: {
      title: string;
      subtitle: string;
      remainingQuota: string;
      inputPlaceholder: string;
      summarizeButton: string;
      error: { somethingWentWrong: string };
      dialog: { title: string; description: string; button: string };
    };
  };
}

const ErrorFallback: React.FC<{ error: Error; dict: ClientHomePageProps["dict"] }> = ({ error, dict }) => (
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
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const [recentVideos, setRecentVideos] = useState<string[]>([]);
  const [summaryFormat, setSummaryFormat] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async (retries = 3) => {
      try {
        setLoading(true);
        const { ip } = await fetch("/api/getIp").then(res => res.json());
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

            if (insertError) throw new Error(`Failed to create anonymous user: ${insertError.message}`);
            setUser(newUser as AnonymousUser);
          } else {
            throw new Error(`Failed to fetch anonymous user: ${error.message}`);
          }
        } else {
          setUser(user as AnonymousUser);
        }

        if (typeof window !== "undefined" && !localStorage.getItem("dialogShown")) {
          setShowDialog(true);
          localStorage.setItem("dialogShown", "true");
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        if (retries > 0) {
          console.log(`Retrying user initialization. Attempts left: ${retries - 1}`);
          await initializeUser(retries - 1);
        } else {
          toast({
            title: "Error",
            description: "Failed to initialize user. Please refresh the page or try again later.",
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
        .from('summaries')
        .select('video_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent videos:', error);
      } else {
        setRecentVideos(data.map(item => item.video_id));
      }
    };

    initializeUser();
    fetchRecentVideos();
  }, [toast]);

  const features = [
    {
      title: "Resúmenes Rápidos",
      description: "Obtén los puntos clave de cualquier video en segundos.",
      icon: "⚡️",
    },
    {
      title: "Ahorro de Tiempo",
      description: "Consume contenido de forma eficiente y productiva.",
      icon: "⏱️",
    },
    {
      title: "Aprendizaje Acelerado",
      description: "Absorbe información más rápido que nunca.",
      icon: "🧠",
    },
    {
      title: "Accesibilidad",
      description: "Perfecto para estudiantes, profesionales y curiosos.",
      icon: "🌍",
    },
  ];

  const testimonials = [
    {
      quote: "Resumyt me ha ahorrado horas de tiempo viendo videos largos.",
      name: "María G.",
      title: "Estudiante universitaria",
      image: "/testimonial1.jpg",
    },
    {
      quote: "Una herramienta indispensable para mi trabajo de investigación.",
      name: "Carlos R.",
      title: "Investigador",
      image: "/testimonial2.jpg",
    },
    {
      quote: "Ahora puedo mantenerme al día con los últimos tutoriales de programación.",
      name: "Ana L.",
      title: "Desarrolladora de software",
      image: "/testimonial3.jpg",
    },
  ];

  const handleFormComplete = (selectedFormat: string) => {
    setSummaryFormat(selectedFormat);
    // Aquí puedes agregar lógica adicional si es necesario
  };

  return (
    <ErrorBoundary FallbackComponent={({ error }) => <ErrorFallback error={error} dict={dict} />}>
      <MainLayout>
        <div className="relative min-h-screen flex flex-col justify-center items-center w-full overflow-hidden">
          <RecentVideoThumbnails videoIds={recentVideos} />
          <BackgroundBeams />
          <div className="z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Sección Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-12 py-20"
            >
              <motion.h1 
                className="text-6xl sm:text-7xl md:text-8xl font-bold relative p-4 rounded-lg bg-background/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <GradientText>{dict.home.title}</GradientText>
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={1200}
                  className="w-full h-full absolute top-0 left-0"
                  particleColor="var(--sparkle-color)"
                />
              </motion.h1>
              <motion.div 
                className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <TextGenerateEffect words={dict.home.subtitle} />
              </motion.div>
              {/* Sección de entrada de video y formulario multistepper */}
              <AnimatePresence>
                {!loading && user && (
                  <motion.div
                    className="space-y-6 w-full max-w-2xl mx-auto"
                    key="user-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    {summaryFormat ? (
                      <VideoInput
                        userId={user.id}
                        isLoading={loading}
                        quotaRemaining={user.quota_remaining}
                        placeholder={dict.home.inputPlaceholder}
                        buttonText={dict.home.summarizeButton}
                        summaryFormat={summaryFormat}
                      />
                    ) : (
                      <MultiStepForm onComplete={handleFormComplete} />
                    )}
                    <p className="text-sm text-muted-foreground text-center">
                      {dict.home.remainingQuota}: {user.quota_remaining}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Sección de características */}
            <motion.div 
              className="mt-20 mb-20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-center mb-10">
                <GradientText>Características principales</GradientText>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-card p-6 rounded-lg shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index, duration: 0.5 }}
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Sección de testimonios */}
            <motion.div
              className="mt-20 mb-20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-center mb-10">
                <GradientText>Lo que dicen nuestros usuarios</GradientText>
              </h2>
              <InfiniteMovingCards items={testimonials} />
            </motion.div>

            {/* Sección CTA */}
            <motion.div
              className="mt-20 mb-20 text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                <GradientText>¿Listo para empezar?</GradientText>
              </h2>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Prueba Resumyt gratis
              </Button>
            </motion.div>
          </div>
        </div>
        <Toaster />
        <AnimatePresence>
          {showDialog && (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{dict.home.dialog.title}</DialogTitle>
                  <DialogDescription className="text-base">{dict.home.dialog.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    onClick={() => setShowDialog(false)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {dict.home.dialog.button}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </MainLayout>
    </ErrorBoundary>
  );
};

export default ClientHomePage;