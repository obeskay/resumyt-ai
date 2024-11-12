import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import VideoInput from "@/components/summary/VideoInput";
import { AnonymousUser } from "@/types/supabase";
import { RecentVideoThumbnails } from "@/components/RecentVideoThumbnails";
import { getSupabase } from "@/lib/supabase";

interface Stats {
  videosProcessed: number;
  activeUsers: number;
  availableLanguages: number;
}

interface HeroSectionProps {
  dict: any;
  user: AnonymousUser | null;
  isSubmitting: boolean;
  onSubmit: (url: string, videoTitle: string) => Promise<void>;
  isLoadingQuota: boolean;
  videoInputRef: React.RefObject<HTMLDivElement>;
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  dict,
  user,
  isSubmitting,
  isLoadingQuota,
  onSubmit,
  videoInputRef,
  onGetStarted,
}) => {
  const [stats, setStats] = useState<Stats>({
    videosProcessed: 0,
    activeUsers: 0,
    availableLanguages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = getSupabase();
      const { data: summariesCount } = await supabase
        .from("summaries")
        .select("count");

      const { data: usersCount } = await supabase.from("users").select("count");

      setStats({
        videosProcessed: summariesCount?.[0]?.count || 10000,
        activeUsers: usersCount?.[0]?.count || 5000,
        availableLanguages: 8,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="relative w-screen overflow-y-visible bg-transparent lg:-mb-12 lg:pb-12">
      {/* Container principal con max-width */}
      <div className="container mx-auto h-full">
        <div className="relative flex flex-col lg:flex-row h-full gap-x-12">
          {/* Sección izquierda */}
          <div className="w-full lg:w-[55%] py-12 lg:py-24 flex flex-col justify-center z-10">
            <div className="max-w-xl space-y-8 lg:-mr-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight">
                  <GradientText>{dict.home?.heroTitle}</GradientText>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-base md:text-lg text-muted-foreground"
              >
                {dict.home?.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={onGetStarted}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  {dict.home?.cta?.button}
                </button>
                <button
                  onClick={() => {
                    const featuresSection = document.getElementById("features");
                    featuresSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-3 border-2 border-primary/20 hover:border-primary/40 text-foreground rounded-lg transition-colors"
                >
                  {dict.home?.cta?.learnMore || "Learn More"}
                </button>
              </motion.div>

              {/* Stats con mejor espaciado */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid glass-card p-6 rounded-xl grid-cols-3 gap-6 pt-8 mt-8 border-t border-border/10 mb-12"
              >
                {[
                  {
                    label: dict.home?.stats?.videos,
                    value: stats.videosProcessed.toLocaleString() + "+",
                  },
                  {
                    label: dict.home?.stats?.users,
                    value: stats.activeUsers.toLocaleString() + "+",
                  },
                  {
                    label: dict.home?.stats?.languages,
                    value: stats.availableLanguages.toLocaleString(),
                  },
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-2xl md:text-3xl font-light">
                      {stat.value}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Sección derecha mejorada */}
          <div className="w-full lg:w-[55%] relative h-[400px] lg:h-auto">
            {/* Fondo con gradiente */}
            <div className="blur-3xl absolute inset-0">
              <div
                className="absolute  inset-0 bg-gradient-to-br from-secondary/0 dark:from-primary/0 via-secondary/10 dark:via-primary/20 to-secondary/0 dark:to-primary/0"
                style={{
                  clipPath: "polygon(50% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
              />
            </div>
            {/* Contenedor del formulario */}
            <div
              className="relative h-full flex items-center pt-4 sm:pt-0"
              ref={videoInputRef}
            >
              <div className="w-full max-w-xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-6 md:p-8 rounded-xl space-y-6 backdrop-blur-sm bg-black/10 border border-white/10"
                >
                  <h2 className="text-xl md:text-2xl font-light text-foreground pl-4">
                    {dict.home?.videoInput?.title}
                  </h2>

                  <div className="relative">
                    {isSubmitting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50 rounded-lg">
                        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <VideoInput
                      isLoadingQuota={isSubmitting}
                      quotaRemaining={user?.quota_remaining || 0}
                      onSubmit={onSubmit}
                      dict={dict}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {user?.quota_remaining &&
                      !isSubmitting &&
                      !isLoadingQuota && (
                        <motion.div
                          layoutId="quota"
                          className="text-sm text-foreground/80 pl-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <TextGenerateEffect
                            words={`${dict.home?.remainingQuota}: ${user?.quota_remaining}`}
                          />
                        </motion.div>
                      )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
