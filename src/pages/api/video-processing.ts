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

    // Usar oEmbed en lugar de la API de YouTube
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    );

    if (!response.ok) {
      // Si oEmbed falla, usar datos mínimos
      return res.status(200).json({
        title: "Untitled Video",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description: "",
      });
    }

    const data = await response.json();

    return res.status(200).json({
      title: data.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      description: data.author_name ? `Video by ${data.author_name}` : "",
    });
  } catch (error) {
    console.error("Error processing video:", error);
    // Proporcionar respuesta de fallback en caso de error
    return res.status(200).json({
      title: "Untitled Video",
      thumbnail: "",
      description: "",
    });
  }
}
