export interface VideoDetails {
  title: string | null;
  thumbnail_url: string | null;
}

export interface SupabaseSummary {
  id: string;
  title: string | null;
  created_at: string;
  video_id: string;
  videos?: VideoDetails | null;
}

export interface Summary {
  id: number;
  video_id: string;
  title: string;
  content: string;
  highlights: {
    text: string;
    timestamp: string;
    importance: number;
  }[];
  extended_summary: string;
  transcript: string;
  format: string;
  created_at: string;
  user_id: string;
  suggested_questions?: any;
  share_url?: string;
  likes_count: number;
  videoId?: string;
  thumbnailUrl?: string;
}

export interface SummaryRequest {
  url: string;
  format: "unified";
  language: string;
  title?: string;
}

export interface SummaryResponse {
  videoId: string;
  summary: Summary;
}
