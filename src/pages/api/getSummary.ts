import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase-server";

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

    // Primero obtenemos el video
    const { data: videoData, error: videoError } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (videoError) {
      console.error("Error fetching video:", videoError);
      return res.status(404).json({ error: "Video not found" });
    }

    // Luego obtenemos el resumen más reciente
    const { data: summaryData, error: summaryError } = await supabase
      .from("summaries")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (summaryError) {
      console.error("Error fetching summary:", summaryError);
      return res.status(404).json({ error: "Summary not found" });
    }

    // Combinamos los datos
    const response = {
      video: videoData,
      summary: {
        ...summaryData,
        content: JSON.parse(summaryData.content),
      },
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
