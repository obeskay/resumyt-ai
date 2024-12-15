import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useMeasure from "react-use-measure";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { VideoInput } from "@/components/summary/VideoInput";
import { AnonymousUser } from "@/types/supabase";
import { RecentVideoThumbnails } from "@/components/RecentVideoThumbnails";
import { getSupabase } from "@/lib/supabase";
import YouTubeLogo from "../YouTubeLogo";
import YouTubeThumbnail from "../YouTubeThumbnail";
import { toast } from "sonner";

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
  const [isVideoDetected, setIsVideoDetected] = useState(false);
  const [heroRef, heroMeasure] = useMeasure();
  const [measureRef, measureBounds] = useMeasure();

  const inputRef = React.useCallback(
    (node: HTMLDivElement) => {
      measureRef(node);
      if (videoInputRef && "current" in videoInputRef) {
        (videoInputRef as React.MutableRefObject<HTMLDivElement>).current =
          node;
      }
    },
    [measureRef, videoInputRef],
  );

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

  const handleSubmit = async (url: string, videoTitle: string) => {
    try {
      await onSubmit(url, videoTitle);
    } catch (error) {
      console.error("Error al procesar el video:", error);
      toast.error(dict.errors?.processingError || "Error processing video");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-screen overflow-hidden bg-transparent">
      <div className="container mx-auto h-full">
        <motion.div
          className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8"
          animate={{
            height: isVideoDetected ? measureBounds.height : heroMeasure.height,
          }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <AnimatePresence mode="wait">
            {!isVideoDetected && (
              <motion.div
                ref={heroRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.5,
                  ease: [0.32, 0.72, 0, 1],
                }}
                className="text-center"
                layoutId="hero-content"
              >
                <motion.div
                  className="mb-6 flex items-center justify-center gap-2 w-32 mx-auto"
                  layoutId="youtube-logo-container"
                >
                  <YouTubeThumbnail
                    src={"/youtube-logo.svg"}
                    alt={"default"}
                    layoutId="youtube-logo"
                  />
                </motion.div>
                <motion.h2
                  className="text-4xl font-medium leading-tight md:text-5xl lg:text-6xl"
                  layoutId="hero-title"
                >
                  <GradientText>{dict.home?.heroTitle}</GradientText>
                </motion.h2>
                <motion.p
                  className="mt-4 text-lg text-muted-foreground md:text-xl"
                  layoutId="hero-subtitle"
                >
                  {dict.home?.subtitle}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={inputRef}
            layoutId="video-input-container"
            className="w-full max-w-3xl relative z-10"
            initial={false}
            animate={{
              width: isVideoDetected ? "100%" : "80%",
              y: isVideoDetected ? 0 : 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.32, 0.72, 0, 1],
              layout: {
                duration: 0.5,
              },
            }}
          >
            <motion.div
              className="w-full"
              layout
              transition={{
                layout: {
                  duration: 0.5,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
            >
              <VideoInput
                isLoadingQuota={isSubmitting}
                quotaRemaining={user?.quota_remaining || 0}
                onSubmit={handleSubmit}
                dict={dict}
                onVideoDetected={setIsVideoDetected}
                onBack={() => setIsVideoDetected(false)}
              />
            </motion.div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isVideoDetected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: 0.2,
                }}
                className="mt-8 grid grid-cols-3 gap-8 text-center"
                layoutId="stats-container"
                layout="position"
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
                  <motion.div
                    key={i}
                    className="space-y-2"
                    layoutId={`stat-${i}`}
                  >
                    <motion.p
                      className="text-2xl font-light md:text-3xl"
                      layoutId={`stat-value-${i}`}
                    >
                      {stat.value}
                    </motion.p>
                    <motion.p
                      className="text-xs text-muted-foreground md:text-sm"
                      layoutId={`stat-label-${i}`}
                    >
                      {stat.label}
                    </motion.p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
