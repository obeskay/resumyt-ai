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
  id: string;
  title: string;
  date: string;
  videoId: string;
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
