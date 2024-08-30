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

  const cards = [
    {
      id: 1,
      content: "Resumyt te ayuda a ahorrar tiempo resumiendo videos de YouTube.",
      name: "Ahorro de tiempo",
      designation: "Característica principal",
    },
    {
      id: 2,
      content: "Obtén los puntos clave de cualquier video en cuestión de segundos.",
      name: "Resúmenes rápidos",
      designation: "Beneficio clave",
    },
    {
      id: 3,
      content: "Perfecto para estudiantes, profesionales y cualquier persona que quiera aprender más rápido.",
      name: "Para todos",
      designation: "Público objetivo",
    },
  ];

  return (
    <ErrorBoundary FallbackComponent={({ error }) => <ErrorFallback error={error} dict={dict} />}>
      <MainLayout>
        <div className="relative min-h-screen flex flex-col justify-center items-center w-full overflow-hidden">
          <RecentVideoThumbnails videoIds={recentVideos} />
          <BackgroundBeams />
          <div className="z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-12 py-20"
            >
              <motion.h1 
                className="text-5xl sm:text-6xl md:text-7xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <GradientText>{dict.home.title}</GradientText>
              </motion.h1>
              <motion.p 
                className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {dict.home.subtitle}
              </motion.p>
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
                    <VideoInput
                      userId={user.id}
                      isLoading={loading}
                      quotaRemaining={user.quota_remaining}
                      placeholder={dict.home.inputPlaceholder}
                      buttonText={dict.home.summarizeButton}
                    />
                    <p className="text-sm text-muted-foreground">
                      {dict.home.remainingQuota}: {user.quota_remaining}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <motion.div 
              className="mt-20 mb-20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-center mb-10">
                <GradientText>Características principales</GradientText>
              </h2>
              <CardStack items={cards} />
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