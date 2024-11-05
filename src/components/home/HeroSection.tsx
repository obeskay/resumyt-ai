import React from "react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import VideoInput from "@/components/summary/VideoInput";
import { AnonymousUser } from "@/types/supabase";

interface HeroSectionProps {
  dict: any;
  user: AnonymousUser | null;
  isSubmitting: boolean;
  onSubmit: (url: string, videoTitle: string) => Promise<void>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  dict,
  user,
  isSubmitting,
  onSubmit,
}) => (
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

    {/* Subtitle */}
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
    </motion.div>

    {/* Video Input */}
    <motion.div
      className="space-y-6 w-full max-w-3xl mx-auto relative"
      key={user?.id}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <VideoInput
        quotaRemaining={user?.quota_remaining || 0}
        onSubmit={onSubmit}
        dict={dict}
      />
      <p className="text-sm text-muted-foreground text-center">
        <TextGenerateEffect
          words={`${dict.home?.remainingQuota ?? "Remaining quota"}: ${user?.quota_remaining || 0}`}
        />
      </p>
    </motion.div>
  </motion.div>
);
