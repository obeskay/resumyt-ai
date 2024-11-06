import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";
import { getVideoDetails } from "@/lib/videoProcessing";

type SummaryFormat = "bullet-points" | "paragraph" | "page" | null;

interface VideoState {
  videoUrl: string;
  transcription: string;
  summary: string;
  isLoading: boolean;
  videoTitle: string;
  videoThumbnail: string;
  summaryFormat: SummaryFormat;
  setVideoUrl: (url: string) => void;
  setTranscription: (transcription: string) => void;
  setSummary: (summary: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setVideoMetadata: (title: string, thumbnail: string) => void;
  setSummaryFormat: (format: SummaryFormat) => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videoUrl: "",
  transcription: "",
  summary: "",
  isLoading: false,
  videoTitle: "",
  videoThumbnail: "",
  summaryFormat: null,
  setVideoUrl: (url) => set({ videoUrl: url }),
  setTranscription: (transcription) => set({ transcription }),
  setSummary: (summary) => set({ summary }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setVideoMetadata: (title, thumbnail) =>
    set({ videoTitle: title, videoThumbnail: thumbnail }),
  setSummaryFormat: (format) => set({ summaryFormat: format }),
}));
