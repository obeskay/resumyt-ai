import { NextApiRequest, NextApiResponse } from "next";
import { summarizeVideo, extractYouTubeId } from "@/lib/videoProcessing";
import { createClient } from "@/lib/supabase-server";
import { getVideoDetails } from "@/lib/videoProcessing";
import { i18n } from "@/i18n-config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url, lang } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const requestedLang =
      lang && typeof lang === "string"
        ? lang.substring(0, 2).toLowerCase()
        : i18n.defaultLocale;

    const language = i18n.locales.includes(requestedLang as any)
      ? requestedLang
      : i18n.defaultLocale;

    // Obtener detalles del video y generar resumen en paralelo
    const [videoDetails, summaryResult] = await Promise.all([
      getVideoDetails(url),
      summarizeVideo(url, language),
    ]);

    if (!summaryResult || !summaryResult.summary) {
      throw new Error("Failed to generate summary");
    }

    const supabase = createClient();

    // Guardar video y resumen en paralelo
    await Promise.all([
      supabase.from("videos").upsert({
        id: videoId,
        url: url,
        title: videoDetails.title,
        thumbnail_url: videoDetails.thumbnail,
      }),
      supabase.from("summaries").upsert({
        video_id: videoId,
        content: JSON.stringify(summaryResult.summary),
        transcript: summaryResult.transcript,
        format: "structured",
        title: videoDetails.title,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        videoId,
        videoDetails: {
          title: videoDetails.title,
          thumbnail: videoDetails.thumbnail,
          url,
        },
        summary: summaryResult.summary,
        transcript: summaryResult.transcript,
        language,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Configure API route to handle larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
    responseLimit: "10mb",
  },
};
