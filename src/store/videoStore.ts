import { create } from 'zustand'
import { toast } from "@/components/ui/use-toast";

interface VideoState {
  videoUrl: string
  transcription: string
  summary: string
  isLoading: boolean
  setVideoUrl: (url: string) => void
  setTranscription: (transcription: string) => void
  setSummary: (summary: string) => void
  setIsLoading: (isLoading: boolean) => void
  summarizeVideo: (userId: string) => Promise<{ videoId: string; summary: string; transcript: string } | null>
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videoUrl: '',
  transcription: '',
  summary: '',
  isLoading: false,
  setVideoUrl: (url) => set({ videoUrl: url }),
  setTranscription: (transcription) => set({ transcription }),
  setSummary: (summary) => set({ summary }),
  setIsLoading: (isLoading) => set({ isLoading }),
  summarizeVideo: async (userId: string) => {
    const { videoUrl, setIsLoading, setSummary } = get();
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
        const errorData = await response.json();
        if (response.status === 403 && errorData.error === 'Quota exceeded') {
          toast({
            title: "Quota Exceeded",
            description: "You have reached your quota for video summaries. Please upgrade your plan to continue.",
            variant: "destructive",
          });
          return null;
        }
        throw new Error(errorData.error || 'Failed to summarize video');
      }

      const data = await response.json();
      setSummary(data.summary);
      return {
        videoId: data.videoId,
        summary: data.summary,
        transcript: data.transcript
      };
    } catch (error) {
      console.error('Error summarizing video:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      });
      setSummary('An error occurred while summarizing the video. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  },
}))
