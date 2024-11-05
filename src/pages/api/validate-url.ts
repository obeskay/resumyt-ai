import { NextApiRequest, NextApiResponse } from "next";
import { VideoFetchError } from "@/lib/errors";
import { validateEnvironmentVariables } from "@/lib/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    validateEnvironmentVariables();

    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res
        .status(400)
        .json({ valid: false, error: "URL de video inválida" });
    }

    const videoId = extractVideoId(videoUrl);

    if (!videoId) {
      return res
        .status(400)
        .json({ valid: false, error: "ID de video no válido" });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`,
    );

    if (!videoDetailsResponse.ok) {
      throw new Error("Failed to fetch video details from YouTube API");
    }

    const videoData = await videoDetailsResponse.json();
    const videoTitle = videoData.items?.[0]?.snippet?.title || "";
    const thumbnailUrl =
      videoData.items?.[0]?.snippet?.thumbnails?.maxresdefault?.url ||
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return res.status(200).json({
      valid: true,
      title: videoTitle,
      thumbnailUrl,
    });
  } catch (error: any) {
    console.error("Error al validar el video:", error);

    if (error instanceof VideoFetchError) {
      return res.status(500).json({
        valid: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      valid: false,
      error: "Error al validar el video",
    });
  }
}

function extractVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
