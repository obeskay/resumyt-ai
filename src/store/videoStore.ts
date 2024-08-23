import { create } from 'zustand'
import { toast } from "@/components/ui/use-toast";

interface VideoState {
  videoUrl: string
  transcription: string
  summary: string
  isLoading: boolean
  userQuotaRemaining: number
  setVideoUrl: (url: string) => void
  setTranscription: (transcription: string) => void
  setSummary: (summary: string) => void
  setIsLoading: (isLoading: boolean) => void
  setUserQuotaRemaining: (quota: number) => void
  summarizeVideo: () => Promise<void>
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videoUrl: '',
  transcription: '',
  summary: '',
  isLoading: false,
  userQuotaRemaining: 3,
  setVideoUrl: (url) => set({ videoUrl: url }),
  setTranscription: (transcription) => set({ transcription }),
  setSummary: (summary) => set({ summary }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setUserQuotaRemaining: (quota) => set({ userQuotaRemaining: quota }),
  summarizeVideo: async () => {
    const { videoUrl, setIsLoading, setSummary, setUserQuotaRemaining } = get();
    setIsLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 && errorData.error === 'Daily limit reached') {
          toast({
            title: "Daily Limit Reached",
            description: "You have reached your daily limit for video summaries. Please try again tomorrow.",
            variant: "destructive",
          });
          setUserQuotaRemaining(0);
          return;
        }
        throw new Error(errorData.error || 'Failed to summarize video');
      }

      const data = await response.json();
      setSummary(data.summary);
      setUserQuotaRemaining(data.userQuotaRemaining);
    } catch (error) {
      console.error('Error summarizing video:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      });
      setSummary('An error occurred while summarizing the video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  },
}))
