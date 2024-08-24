import React, { useCallback, useState, useEffect } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface VideoInputProps {
  userId: string;
  quotaRemaining: number;
}

const VideoInput: React.FC<VideoInputProps> = ({ userId, quotaRemaining }) => {
  const { videoUrl, setVideoUrl } = useVideoStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateSubmission = useCallback(async (): Promise<boolean> => {
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return false;
    }

    if (quotaRemaining <= 0) {
      toast({
        title: "Error",
        description: "You have reached your quota limit",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [videoUrl, quotaRemaining, toast]);

  const submitVideo = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      router.push(`/summary/${data.videoId}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [videoUrl, userId, router, toast]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (await validateSubmission()) {
        await submitVideo();
      }
    },
    [validateSubmission, submitVideo]
  );

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
          className="bg-popover"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <Button
          size="lg"
          type="submit"
          disabled={isLoading}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-red-500 hover:bg-red-600 text-white px-6 h-10"
        >
          RESUMIR
        </Button>
      </form>
      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default VideoInput;
