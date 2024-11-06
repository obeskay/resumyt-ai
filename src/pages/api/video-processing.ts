import { NextApiRequest, NextApiResponse } from "next";
import { extractYouTubeId } from "@/lib/videoProcessing";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "Video URL is required" });
    }

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    // Obtener detalles del video usando la API de YouTube
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=snippet`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video details from YouTube API");
    }

    const data = await response.json();
    const videoDetails = data.items[0]?.snippet;

    if (!videoDetails) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Asegurarse de que el título no esté vacío
    const title = videoDetails.title || "Untitled Video";

    return res.status(200).json({
      title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      description: videoDetails.description,
    });
  } catch (error) {
    console.error("Error processing video:", error);
    return res
      .status(500)
      .json({ error: "Failed to process video", details: error });
  }
}
