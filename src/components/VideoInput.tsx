import React, { useCallback } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/components/ui/use-toast";
import { PricingPlansDialog } from "@/components/PricingPlansDialog";

const VideoInput: React.FC = React.memo(() => {
  const {
    videoUrl,
    setVideoUrl,
    isLoading,
    summarizeVideo,
    userQuotaRemaining,
  } = useVideoStore();
  const { toast } = useToast();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (userQuotaRemaining <= 0) {
      toast({
        title: "Daily Limit Reached",
        description:
          "You have reached your daily limit for video summaries. Please upgrade your plan to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      await summarizeVideo();
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [videoUrl, userQuotaRemaining, summarizeVideo, toast]);

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
            disabled={isLoading || userQuotaRemaining <= 0}
            className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-r-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resumiendo..." : "RESUMIR"}
          </button>
        </div>
      </form>
      {isLoading && (
        <div className="mt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full animate-pulse"
              style={{ width: "100%" }}
            ></div>
          </div>
          <p className="text-center mt-2 text-sm text-muted-foreground">
            Resumiendo el video...
          </p>
        </div>
      )}
      <div className="text-center mt-4">
        {userQuotaRemaining > 0 ? (
          <p className="text-sm text-muted-foreground">
            You have {userQuotaRemaining} summaries remaining today.
          </p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              You have reached your daily limit for video summaries.
            </p>
            <PricingPlansDialog />
          </div>
        )}
      </div>
    </div>
  );
});

VideoInput.displayName = "VideoInput";

export default VideoInput;
