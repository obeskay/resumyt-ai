import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!isVideoDetected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8 text-center"
              >
                <div className="mb-6 flex items-center justify-center gap-2 w-32 mx-auto">
                  <YouTubeThumbnail
                    src={"/youtube-logo.svg"}
                    alt={"default"}
                    layoutId="video-thumbnail-mask"
                  />
                </div>
                <h2 className="text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">
                  <GradientText>{dict.home?.heroTitle}</GradientText>
                </h2>
                <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                  {dict.home?.subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layoutId="video-input-container"
            className="w-full max-w-3xl"
            ref={videoInputRef}
            transition={{ duration: 0.3 }}
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

          <AnimatePresence mode="wait">
            {!isVideoDetected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-8 grid grid-cols-3 gap-8 text-center"
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
                    <p className="text-2xl font-light md:text-3xl">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
