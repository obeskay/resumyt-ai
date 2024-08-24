import { create } from 'zustand'
import { toast } from "@/components/ui/use-toast";

type SummaryFormat = 'bullet-points' | 'paragraph' | 'page' | null;

interface VideoState {
  videoUrl: string
  transcription: string
  summary: string
  isLoading: boolean
  videoTitle: string
  videoThumbnail: string
  summaryFormat: SummaryFormat
  setVideoUrl: (url: string) => void
  setTranscription: (transcription: string) => void
  setSummary: (summary: string) => void
  setIsLoading: (isLoading: boolean) => void
  setVideoMetadata: (title: string, thumbnail: string) => void
  setSummaryFormat: (format: SummaryFormat) => void
  summarizeVideo: (userId: string) => Promise<{ videoId: string; summary: string; transcript: string } | null>
  fetchVideoMetadata: (url: string) => Promise<void>
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videoUrl: '',
  transcription: '',
  summary: '',
  isLoading: false,
  videoTitle: '',
  videoThumbnail: '',
  summaryFormat: null,
  setVideoUrl: (url) => set({ videoUrl: url }),
  setTranscription: (transcription) => set({ transcription }),
  setSummary: (summary) => set({ summary }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setVideoMetadata: (title, thumbnail) => set({ videoTitle: title, videoThumbnail: thumbnail }),
  setSummaryFormat: (format) => set({ summaryFormat: format }),
  summarizeVideo: async (userId: string) => {
    const { videoUrl, setIsLoading, setSummary, summaryFormat } = get();
    setIsLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl, userId, summaryFormat }),
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
  fetchVideoMetadata: async (url: string) => {
    try {
      const response = await fetch('/api/videoProcessing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video metadata');
      }

      const data = await response.json();
      set({ videoTitle: data.title, videoThumbnail: data.thumbnail });
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      toast({
        title: "Error",
        description: "Failed to fetch video metadata. Please try again.",
        variant: "destructive",
      });
    }
  },
}))
