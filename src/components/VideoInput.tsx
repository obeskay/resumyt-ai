import React, { useCallback, useState } from "react";
import { useVideoStore } from "@/store/videoStore";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useRouter } from "next/navigation";

interface VideoInputProps {
  userId: string;
  quotaRemaining: number;
}

const VideoInput: React.FC<VideoInputProps> = ({ userId, quotaRemaining }) => {
  const { videoUrl, setVideoUrl } = useVideoStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

      if (quotaRemaining <= 0) {
        toast({
          title: "Error",
          description: "You have reached your quota limit",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl, userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate summary');
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
    },
    [videoUrl, userId, quotaRemaining, toast, router]
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
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-r-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resumiendo..." : "RESUMIR"}
          </button>
        </div>
      </form>
      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default VideoInput;
