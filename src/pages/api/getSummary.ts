import { getSupabase } from "@/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Video ID is required" });
  }

  const supabase = getSupabase();

  try {
    const { data: summariesData, error } = await supabase
      .from("summaries")
      .select(
        `
        id,
        content,
        transcript,
        video_id,
        format,
        title,
        highlights,
        extended_summary,
        videos (
          id,
          thumbnail_url
        )
      `,
      )
      .eq("video_id", id);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!summariesData || summariesData.length === 0) {
      return res.status(404).json({ error: "Summary not found" });
    }

    const formattedSummaries = summariesData.map((summary) => ({
      content: summary.content,
      transcript: summary.transcript,
      videoId: summary.video_id,
      title: summary.title,
      thumbnailUrl: summary.videos?.[0]?.thumbnail_url || "",
      format: summary.format,
      highlights: summary.highlights || [],
      extended_summary: summary.extended_summary || summary.content,
    }));

    return res.status(200).json(formattedSummaries);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
