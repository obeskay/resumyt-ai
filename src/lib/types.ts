export interface VideoSummary {
  introduction: string;
  mainPoints: {
    id: number;
    point: string;
  }[];
  conclusions: string;
}

export interface ProcessedVideo {
  videoId: string;
  title: string;
  url: string;
  summary: VideoSummary;
  transcript: string;
  thumbnailUrl?: string;
}

export interface VideoDetails {
  title: string;
  description: string;
  thumbnailUrl: string;
}
