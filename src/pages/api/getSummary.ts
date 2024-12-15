import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase-server";
import { Summary, VideoDetails } from "@/types/summary";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id: videoId } = req.query;

  if (!videoId || typeof videoId !== "string") {
    return res.status(400).json({ error: "Video ID is required" });
  }

  try {
    const supabase = createClient();

    // First get the video
    const { data: videoData, error: videoError } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (videoError) {
      console.error("Error fetching video:", videoError);
      return res.status(404).json({ error: "Video not found" });
    }

    // Then get the most recent summary
    const { data: summaryData, error: summaryError } = await supabase
      .from("summaries")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (summaryError) {
      console.error("Error fetching summary:", summaryError);
      return res.status(404).json({ error: "Summary not found" });
    }

    // Check if we got any summary data
    if (!summaryData || summaryData.length === 0) {
      console.error("No summary found for video:", videoId);
      return res.status(404).json({ error: "Summary not found" });
    }

    // Use the first (most recent) summary
    const latestSummary = summaryData[0];

    // Parse the content and ensure it has the required structure
    let parsedContent;
    try {
      parsedContent = JSON.parse(latestSummary.content);
    } catch (error) {
      console.error("Error parsing summary content:", error);
      parsedContent = {
        introduction: "Could not generate detailed summary.",
        mainPoints: [],
        conclusions: "Please try again later.",
      };
    }

    // Ensure the content has the required structure
    if (
      !parsedContent.introduction ||
      !parsedContent.mainPoints ||
      !parsedContent.conclusions
    ) {
      parsedContent = {
        introduction:
          parsedContent.introduction || "Could not generate detailed summary.",
        mainPoints: parsedContent.mainPoints || [],
        conclusions: parsedContent.conclusions || "Please try again later.",
      };
    }

    // Combine the data
    const response = {
      video: {
        id: videoData.id,
        title: videoData.title,
        thumbnail_url: videoData.thumbnail_url,
      } as VideoDetails,
      summary: {
        ...latestSummary,
        content: parsedContent,
      } as Summary,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getSummary:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
