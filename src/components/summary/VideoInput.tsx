"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { VideoFetchError, VideoTitleError } from "@/lib/errors";
import YouTubeThumbnail from "../YouTubeThumbnail";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

interface VideoInputProps {
  quotaRemaining: number;
  onSubmit: (url: string, videoTitle: string) => Promise<void>;
  dict: any;
  isLoadingQuota: boolean;
  onVideoDetected?: (detected: boolean) => void;
  onBack?: () => void;
}

const VideoInput: React.FC<VideoInputProps> = ({
  quotaRemaining,
  onSubmit,
  isLoadingQuota,
  dict,
  onVideoDetected,
  onBack,
}) => {
  const [videoDetails, setVideoDetails] = useState<{
    title: string;
    thumbnail: string;
  } | null>(null);
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const { toast } = useToast();
  const debouncedUrl = useDebounce(url, 500);

  const extractYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchVideoDetails = async (videoUrl: string) => {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      setIsValidUrl(false);
      setVideoDetails(null);
      onVideoDetected?.(false);
      return;
    }

    try {
      const videoDetailsResponse = await fetch("/api/video-processing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!videoDetailsResponse.ok) {
        throw new Error("Failed to fetch video details");
      }

      const videoDetailsData = await videoDetailsResponse.json();

      if (!videoDetailsData.title) {
        throw new VideoTitleError("No se pudo obtener el título del video");
      }

      setVideoDetails(videoDetailsData);
      setIsValidUrl(true);
      onVideoDetected?.(true);
    } catch (error) {
      console.error("Error:", error);
      setIsValidUrl(false);
      setVideoDetails(null);
      onVideoDetected?.(false);
    }
  };

  useEffect(() => {
    if (debouncedUrl) {
      fetchVideoDetails(debouncedUrl);
    } else {
      setIsValidUrl(false);
      setVideoDetails(null);
      onVideoDetected?.(false);
    }
  }, [debouncedUrl, onVideoDetected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !isValidUrl) return;

    setIsValidating(true);
    try {
      await onSubmit(url, videoDetails?.title || "");
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

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="flex flex-col gap-3">
          <div className="relative flex w-full items-center gap-2">
            <AnimatePresence mode="wait">
              {videoDetails && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setUrl("");
                      setVideoDetails(null);
                      setIsValidUrl(false);
                      onVideoDetected?.(false);
                      onBack?.();
                    }}
                    className="h-9 w-9 rounded-full"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Input
              type="url"
              placeholder={
                dict.home.videoInput?.placeholder ?? "Paste YouTube URL here"
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`h-12 w-full rounded-full border-2 pr-4 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 ${
                isValidUrl ? "border-primary" : "border-border"
              }`}
              required
            />
            <div className="absolute right-2">
              <Button
                type="submit"
                disabled={!isValidUrl || isValidating || quotaRemaining <= 0}
                className={`h-9 overflow-hidden rounded-full px-4 transition-colors
                  ${isValidUrl ? "bg-red-500 hover:bg-red-600" : "bg-gray-400"}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="relative">
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    (dict.home.videoInput?.button ?? "Resumir")
                  )}
                </span>
              </Button>
            </div>
          </div>

          {url && !isValidUrl && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-red-500"
            >
              {dict.home.error?.invalidUrl ?? "Invalid YouTube URL"}
            </motion.p>
          )}
        </div>
      </form>

      <AnimatePresence mode="wait">
        {videoDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-8 aspect-video w-full overflow-hidden rounded-2xl"
          >
            <YouTubeThumbnail
              src={videoDetails.thumbnail}
              alt={videoDetails.title}
              layoutId="video-thumbnail-mask"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <h3 className="max-w-2xl text-center text-lg font-medium text-white">
                {videoDetails.title}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoInput;
