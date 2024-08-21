import { create } from 'zustand'

interface VideoState {
  videoUrl: string
  transcription: string
  summary: string
  isTranscribing: boolean
  isSummarizing: boolean
  isLoading: boolean
  userQuotaRemaining: number
  setVideoUrl: (url: string) => void
  setTranscription: (transcription: string) => void
  setSummary: (summary: string) => void
  setIsTranscribing: (isTranscribing: boolean) => void
  setIsSummarizing: (isSummarizing: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  setUserQuotaRemaining: (quota: number) => void
}

export const useVideoStore = create<VideoState>((set) => ({
  videoUrl: '',
  transcription: '',
  summary: '',
  isTranscribing: false,
  isSummarizing: false,
  isLoading: false,
  userQuotaRemaining: 3,
  setVideoUrl: (url) => set({ videoUrl: url }),
  setTranscription: (transcription) => set({ transcription }),
  setSummary: (summary) => set({ summary }),
  setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
  setIsSummarizing: (isSummarizing) => set({ isSummarizing }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setUserQuotaRemaining: (quota) => set({ userQuotaRemaining: quota }),
}))
