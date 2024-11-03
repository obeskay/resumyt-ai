import { getSupabase } from "./supabase";
import type { Database } from "@/types/supabase";

type Summary = Database["public"]["Tables"]["summaries"]["Row"];

async function getSummaryById(videoId: string): Promise<Summary> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("summaries")
    .select(
      `
      id,
      video_id,
      title,
      content,
      transcript,
      format,
      created_at,
      user_id,
      suggested_questions,
      videos (
        title,
        url,
        thumbnail_url
      )
    `,
    )
    .eq("video_id", videoId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Summary not found");

  return data;
}

export async function shareToSocialMedia(videoId: string, platform: string) {
  const summary = await getSummaryById(videoId);
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/summary/${videoId}`;
  const title = summary.title || "Video Summary";

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export async function getShareableLink(videoId: string): Promise<string> {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/summary/${videoId}`;
}
