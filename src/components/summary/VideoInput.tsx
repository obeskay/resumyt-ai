"use client";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useLoadingAnimation } from "@/hooks/useLoadingAnimation";
import { VideoFetchError, VideoTitleError } from "@/lib/errors";
import YouTubeThumbnail from "../YouTubeThumbnail";
import { AnimatePresence, motion } from "framer-motion";

interface VideoInputProps {
  quotaRemaining: number;
  onSubmit: (url: string, videoTitle: string) => Promise<void>;
  dict: any;
  isLoadingQuota: boolean;
}

const VideoInput: React.FC<VideoInputProps> = ({
  quotaRemaining,
  onSubmit,
  isLoadingQuota,
  dict,
}) => {
  const [videoDetails, setVideoDetails] = useState<{
    title: string;
    thumbnail: string;
  } | null>(null);
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsValidating(true);
    try {
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        throw new Error(dict.home.error?.invalidUrl ?? "Invalid YouTube URL");
      }

      const videoDetailsResponse = await fetch("/api/video-processing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!videoDetailsResponse.ok) {
        throw new Error("Failed to fetch video details");
      }

      const videoDetailsData = await videoDetailsResponse.json();

      if (!videoDetailsData.title) {
        throw new VideoTitleError("No se pudo obtener el título del video");
      }

      setVideoDetails(videoDetailsData);

      await onSubmit(url, videoDetailsData.title);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: dict.home.error?.title ?? "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex flex-col sm:flex-row">
          <Input
            type="url"
            placeholder={
              dict.home.videoInput?.placeholder ?? "Paste YouTube URL here"
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 pr-16"
            required
          />
          <Button
            type="submit"
            disabled={!url || isValidating || quotaRemaining <= 0}
            className="min-w-[120px] rounded-full absolute right-1 top-1/2 -translate-y-1/2"
          >
            {isValidating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {dict.home.videoInput?.processing ?? "Processing..."}
              </div>
            ) : (
              (dict.home.videoInput?.button ?? "Summarize")
            )}
          </Button>
        </div>
      </form>

      {videoDetails && (
        <div className="flex flex-col items-center">
          <YouTubeThumbnail
            src={videoDetails.thumbnail}
            alt={videoDetails.title}
          />
          <p className="mt-2 text-center font-medium">{videoDetails.title}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {quotaRemaining <= 1 && !isLoadingQuota && (
          <motion.div
            layoutId="quota"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 2.5 } }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>
                {dict.home.alerts?.lowQuota?.title ?? "Low Quota Alert"}
              </AlertTitle>
              <AlertDescription>
                {dict.home.alerts?.lowQuota?.message ??
                  "You're running low on summaries. Consider upgrading your plan!"}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoInput;
