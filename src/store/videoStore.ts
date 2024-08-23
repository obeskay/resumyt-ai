import { create } from 'zustand'

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
        throw new Error('Failed to summarize video');
      }

      const data = await response.json();
      setSummary(data.summary);
      setUserQuotaRemaining(data.userQuotaRemaining);
    } catch (error) {
      console.error('Error summarizing video:', error);
      setSummary('An error occurred while summarizing the video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  },
}))
