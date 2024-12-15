"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { VideoFetchError, VideoTitleError } from "@/lib/errors";
import YouTubeThumbnail from "../YouTubeThumbnail";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import useMeasure from "react-use-measure";

interface VideoInputProps {
  isLoadingQuota: boolean;
  quotaRemaining: number;
  onSubmit: (url: string, videoTitle: string) => Promise<void>;
  dict: any;
  onVideoDetected: (detected: boolean) => void;
  onBack: () => void;
}

export const VideoInput: React.FC<VideoInputProps> = ({
  isLoadingQuota,
  quotaRemaining,
  onSubmit,
  dict,
  onVideoDetected,
  onBack,
}) => {
  const [wrapperRef, wrapperBounds] = useMeasure();
  const [containerRef, containerBounds] = useMeasure();
  const [inputRef, inputBounds] = useMeasure();
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
      onVideoDetected(false);
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
      onVideoDetected(true);
    } catch (error) {
      console.error("Error:", error);
      setIsValidUrl(false);
      setVideoDetails(null);
      onVideoDetected(false);
    }
  };

  useEffect(() => {
    if (debouncedUrl) {
      fetchVideoDetails(debouncedUrl);
    } else {
      setIsValidUrl(false);
      setVideoDetails(null);
      onVideoDetected(false);
    }
  }, [debouncedUrl, onVideoDetected]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url || !isValidUrl || !videoDetails) return;

    try {
      await onSubmit(url, videoDetails.title);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return (
    <LayoutGroup>
      <motion.div
        initial={{ opacity: 0, y: 20, height: "auto" }}
        layoutId="video-input-wrapper"
        animate={{
          opacity: 1,
          y: 0,
          height: containerBounds.height || "auto",
          transition: {
            opacity: { duration: 0.2, ease: "easeOut" },
          },
        }}
        transition={{
          ease: "easeOut",
          duration: 0.3,
        }}
        ref={wrapperRef}
        className="w-full max-w-3xl mx-auto"
      >
        <motion.div
          ref={containerRef}
          className="relative rounded-2xl border bg-card/50 backdrop-blur-sm p-6 shadow-xl ring-1 ring-black/5 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="relative w-full">
            <div className="flex flex-col gap-4">
              <div className="flex w-full items-center gap-3">
                <AnimatePresence mode="popLayout">
                  {videoDetails && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setUrl("");
                          setVideoDetails(null);
                          setIsValidUrl(false);
                          onVideoDetected(false);
                          onBack();
                        }}
                        className="h-12 w-12 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={inputRef} className="relative flex-1">
                  <Input
                    type="url"
                    placeholder={
                      dict.home.videoInput?.placeholder ??
                      "Paste YouTube URL here"
                    }
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-12 w-full rounded-xl border-2 pl-6 pr-[120px] transition-all duration-300 ease-out focus-visible:ring-0 focus-visible:ring-offset-0 bg-white/80 border-border/40 focus:border-red-500"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                      type="submit"
                      disabled={
                        !isValidUrl ||
                        isValidating ||
                        quotaRemaining <= 0 ||
                        isLoadingQuota
                      }
                      className={`h-9 rounded-xl px-6 transition-all duration-300 whitespace-nowrap
                        ${
                          isValidUrl
                            ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30"
                            : "bg-gray-100 text-gray-400"
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transform hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      {isValidating || isLoadingQuota ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="relative font-medium">
                          {dict.home.videoInput?.button ?? "Resumir"}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {url && !isValidUrl && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="text-sm text-red-500 pl-2 flex items-center gap-2"
                  >
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                    {dict.home.error?.invalidUrl ?? "Invalid YouTube URL"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>

          <AnimatePresence mode="popLayout">
            {videoDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="flex flex-col items-center aspect-video w-full overflow-hidden rounded-xl relative"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className="w-full h-full aspect-video overflow-hidden rounded-xl relative"
                >
                  <YouTubeThumbnail
                    src={videoDetails.thumbnail}
                    alt={videoDetails.title}
                  />
                </motion.div>

                <motion.h3
                  className="max-w- text-center text-lg font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    delay: 0.1,
                  }}
                >
                  {videoDetails.title}
                </motion.h3>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
};
