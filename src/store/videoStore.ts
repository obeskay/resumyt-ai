import { create } from 'zustand'

interface VideoState {
  videoUrl: string
  transcription: string
  summary: string
  isTranscribing: boolean
  isSummarizing: boolean
  setVideoUrl: (url: string) => void
  setTranscription: (transcription: string) => void
  setSummary: (summary: string) => void
  setIsTranscribing: (isTranscribing: boolean) => void
  setIsSummarizing: (isSummarizing: boolean) => void
}

export const useVideoStore = create<VideoState>((set) => ({
  videoUrl: '',
  transcription: '',
  summary: '',
  isTranscribing: false,
  isSummarizing: false,
  setVideoUrl: (url) => set({ videoUrl: url }),
  setTranscription: (transcription) => set({ transcription }),
  setSummary: (summary) => set({ summary }),
  setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
  setIsSummarizing: (isSummarizing) => set({ isSummarizing }),
}))