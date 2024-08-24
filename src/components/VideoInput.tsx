import React, { useCallback, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/components/ui/use-toast";
import { handleError } from "@/utils/error-handling";
import LoadingIndicator from "@/components/LoadingIndicator";
import QuotaMessage from "@/components/QuotaMessage";

interface VideoInputProps {
  onSuccess: (videoId: string, summary: string, transcript: string) => void;
  onStart: () => void;
  userId: string;
  quotaRemaining: number;
}

const VideoInput: React.FC<VideoInputProps> = React.memo(
  ({ onSuccess, onStart, userId, quotaRemaining }) => {
    const { videoUrl, setVideoUrl, isLoading, setIsLoading, summarizeVideo } =
      useVideoStore();
    const { toast } = useToast();
    const [localQuotaRemaining, setLocalQuotaRemaining] =
      useState(quotaRemaining);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        if (!videoUrl.trim()) {
          toast({
            title: "Error",
            description: "Please enter a YouTube URL",
            variant: "destructive",
          });
          return;
        }

        if (localQuotaRemaining <= 0) {
          toast({
            title: "Quota Exceeded",
            description:
              "You have reached your quota for video summaries. Please upgrade your plan to continue.",
            variant: "destructive",
          });
          return;
        }

        try {
          setIsLoading(true);
          onStart();

          const result = await summarizeVideo(userId);
          if (result) {
            onSuccess(result.videoId, result.summary, result.transcript);
            setLocalQuotaRemaining(result.quotaRemaining);
          }
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "Rate limit exceeded"
          ) {
            toast({
              title: "Rate Limit Exceeded",
              description: "Please wait before making another request.",
              variant: "destructive",
            });
          } else {
            handleError(error, toast);
          }
        } finally {
          setIsLoading(false);
        }
      },
      [
        videoUrl,
        localQuotaRemaining,
        summarizeVideo,
        userId,
        onStart,
        onSuccess,
        toast,
        setIsLoading,
      ]
    );

    return (
      <div className="max-w-3xl mx-auto mt-10">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              className="flex-grow px-4 py-2 bg-card border border-input rounded-l-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <button
              type="submit"
              disabled={isLoading || localQuotaRemaining <= 0}
              className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-r-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resumiendo..." : "RESUMIR"}
            </button>
          </div>
        </form>
        {isLoading && <LoadingIndicator />}
        <QuotaMessage quotaRemaining={localQuotaRemaining} />
      </div>
    );
  }
);

VideoInput.displayName = "VideoInput";

export default VideoInput;
