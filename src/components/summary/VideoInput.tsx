"use client";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useLoadingAnimation } from "@/hooks/useLoadingAnimation";
import { VideoFetchError } from "@/lib/errors";
import YouTubeThumbnail from "../YouTubeThumbnail";

interface VideoInputProps {
  quotaRemaining: number;
  onSubmit: (url: string, videoTitle: string) => Promise<void>;
  dict: any;
}

const VideoInput: React.FC<VideoInputProps> = ({
  quotaRemaining,
  onSubmit,
  dict,
}) => {
  const [videoDetails, setVideoDetails] = useState<{
    title: string;
    thumbnail: string;
  } | null>(null);
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { currentAnimation } = useLoadingAnimation();
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

      const response = await fetch(`/api/validate-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, videoUrl: url }),
      });

      if (!response.ok) {
        throw new VideoFetchError(
          dict.home.error?.videoFetch ?? "Failed to fetch video data",
        );
      }

      const data = await response.json();
      if (!data.valid) {
        throw new Error(
          (data.error || dict.home.error?.invalidVideo) ?? "Invalid video",
        );
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

      const videoDetailsAux = await videoDetailsResponse.json();
      setVideoDetails(videoDetailsAux);
      await onSubmit(url, videoDetailsAux.title || "");
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

      {quotaRemaining <= 1 && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>
            {dict.home.alerts?.lowQuota?.title ?? "Low Quota Alert"}
          </AlertTitle>
          <AlertDescription>
            {dict.home.alerts?.lowQuota?.message ??
              "You're running low on summaries. Consider upgrading your plan!"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VideoInput;
