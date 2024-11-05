import { createClient, ensureVideoExists } from "@/lib/supabase-server";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
  DatabaseInsertError,
} from "./errors";
import { YoutubeTranscript } from "youtube-transcript";
import axios, { AxiosError } from "axios";

import { logger } from "./logger";

// Simple in-memory cache for transcripts and metadata
const transcriptCache: { [key: string]: { data: string; timestamp: number } } =
  {};
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i)),
      );
    }
  }
  throw lastError || new Error("Operation failed after max retries");
}

export async function summarizeVideo(
  videoUrl: string,
  language: string,
): Promise<{ summary: string; transcript: string }> {
  try {
    console.log("Starting summarizeVideo for URL:", videoUrl);
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      console.error("Invalid YouTube URL:", videoUrl);
      throw new VideoFetchError("Invalid YouTube URL");
    }
    console.log("Extracted video ID:", videoId);

    const transcriptOrMetadata = await transcribeVideoWithFallback(videoId);
    console.log(
      "Transcripción o metadatos recuperados, longitud:",
      transcriptOrMetadata.length,
    );

    const summary = await generateSummary(transcriptOrMetadata, language);
    console.log("Resumen generado, longitud:", summary.length);

    if (!summary) {
      console.error("El resumen generado es nulo o está vacío");
      throw new SummaryGenerationError(
        "Failed to generate summary: Summary is null or empty",
      );
    }

    return { summary, transcript: transcriptOrMetadata };
  } catch (error) {
    console.error("Error summarizing video:", error);
    if (
      error instanceof VideoFetchError ||
      error instanceof TranscriptNotFoundError ||
      error instanceof SummaryGenerationError
    ) {
      throw error;
    }
    throw new VideoFetchError("Failed to summarize video");
  }
}

export async function processVideo(
  videoUrl: string,
  userId: string,
  videoTitle: string,
): Promise<{ videoId: string; transcriptOrMetadata: string; summary: string }> {
  try {
    console.log("Starting processVideo for URL:", videoUrl);
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      console.error("Invalid YouTube URL:", videoUrl);
      throw new VideoFetchError("Invalid YouTube URL");
    }
    console.log("Extracted video ID:", videoId);

    const transcriptOrMetadata = await transcribeVideoWithFallback(videoId);
    console.log(
      "Transcript o metadatos recuperados, longitud:",
      transcriptOrMetadata.length,
    );

    const summary = await generateSummary(transcriptOrMetadata, "es");
    console.log("Resumen generado, longitud:", summary.length);

    await saveSummary(
      videoId,
      videoUrl,
      transcriptOrMetadata,
      summary,
      userId,
      "unified",
      videoTitle,
    );
    console.log("Summary saved successfully");

    return { videoId, transcriptOrMetadata, summary };
  } catch (error) {
    console.error("Error processing video:", error);
    if (
      error instanceof VideoFetchError ||
      error instanceof TranscriptNotFoundError ||
      error instanceof SummaryGenerationError ||
      error instanceof DatabaseInsertError
    ) {
      throw error;
    }
    throw new VideoFetchError("Failed to process video");
  }
}

async function checkVideoAvailability(videoId: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `https://www.youtube.com/oembed?format=json&url=http://www.youtube.com/watch?v=${videoId}`,
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function getBasicVideoInfo(videoId: string): Promise<string> {
  const response = await fetch(
    `https://www.youtube.com/oembed?format=json&url=http://www.youtube.com/watch?v=${videoId}`,
  );
  const data = await response.json();
  return `Title: ${data.title}\nAuthor: ${data.author_name}`;
}

async function fetchYouTubeSubtitles(videoId: string): Promise<string> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YouTube API key is not set");
  }

  try {
    // Obtener la lista de subtítulos disponibles
    const captionsResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/captions`,
      {
        params: {
          part: "snippet",
          videoId: videoId,
          key: apiKey,
        },
      },
    );

    if (captionsResponse.data.items && captionsResponse.data.items.length > 0) {
      const captionId = captionsResponse.data.items[0].id;

      // Obtener el contenido de los subtítulos
      const subtitlesResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/captions/${captionId}`,
        {
          params: {
            tfmt: "srt",
            key: apiKey,
          },
          headers: {
            Accept: "application/json",
          },
        },
      );

      // Procesar y limpiar los subtítulos
      const subtitles = subtitlesResponse.data;
      const cleanedSubtitles = subtitles.replace(
        /\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/g,
        "",
      );
      return cleanedSubtitles.replace(/\n/g, " ").trim();
    } else {
      throw new Error("No se encontraron subtítulos para este video");
    }
  } catch (error) {
    console.error("Error al obtener los subtítulos de YouTube:", error);
    throw error;
  }
}

export async function transcribeVideoWithFallback(
  videoId: string,
): Promise<string> {
  console.log("Iniciando transcribeVideoWithFallback para videoId:", videoId);

  // Verificar caché primero
  if (
    transcriptCache[videoId] &&
    Date.now() - transcriptCache[videoId].timestamp < CACHE_EXPIRATION
  ) {
    console.log("Transcript encontrado en caché para video ID:", videoId);
    return transcriptCache[videoId].data;
  }

  // Verificar disponibilidad del video
  console.log("Verificando disponibilidad del video:", videoId);
  const isAvailable = await checkVideoAvailability(videoId);
  if (!isAvailable) {
    console.error("El video no está disponible:", videoId);
    throw new VideoFetchError(
      "El video no está disponible o ha sido eliminado",
    );
  }

  try {
    console.log("Intentando obtener la transcripción para el video:", videoId);
    let transcript;
    try {
      const transcriptArray: any = await retryOperation(() =>
        YoutubeTranscript.fetchTranscript(videoId),
      );
      transcript = transcriptArray.map((item: any) => item.text).join(" ");
    } catch (ytError) {
      console.log(
        "Error con YoutubeTranscript, intentando con la API de YouTube:",
        ytError,
      );
      transcript = await fetchYouTubeSubtitles(videoId);
    }
    console.log(
      "Transcripción obtenida exitosamente, longitud:",
      transcript.length,
    );

    // Cachear la transcripción
    transcriptCache[videoId] = { data: transcript, timestamp: Date.now() };

    return transcript;
  } catch (error) {
    console.error("Error al obtener la transcripción:", error);
    console.error("Detalles del error:", JSON.stringify(error, null, 2));

    if (error instanceof Error && error.message.includes("410")) {
      console.log(
        "Transcripción no disponible (error 410), recurriendo a los metadatos del video",
      );
    } else {
      console.log("Recurriendo a los metadatos del video para el ID:", videoId);
    }

    try {
      console.log("Intentando obtener metadatos del video");
      const metadata = await fetchVideoMetadata(videoId);
      console.log("Metadatos obtenidos exitosamente:", {
        title: metadata.title,
        descriptionLength: metadata.description.length,
        thumbnailUrl: metadata.thumbnailUrl,
      });
      return `Title: ${metadata.title}\n\nDescription: ${metadata.description}`;
    } catch (metadataError) {
      console.error("Error al obtener los metadatos del video:", metadataError);
      try {
        console.log("Intentando obtener información básica del video");
        const basicInfo = await getBasicVideoInfo(videoId);
        console.log(
          "Información básica obtenida exitosamente, longitud:",
          basicInfo.length,
        );
        return basicInfo;
      } catch (basicInfoError) {
        console.error(
          "Error al obtener información básica del video:",
          basicInfoError,
        );
        throw new TranscriptNotFoundError(
          "No se pudo obtener la transcripción, los metadatos ni la información básica",
        );
      }
    }
  }
}

async function fetchVideoMetadata(
  videoId: string,
): Promise<{ title: string; thumbnailUrl: string; description: string }> {
  // Check cache first
  if (
    transcriptCache[videoId] &&
    Date.now() - transcriptCache[videoId].timestamp < CACHE_EXPIRATION
  ) {
    console.log("Metadata found in cache for video ID:", videoId);
    return transcriptCache[videoId].data as any;
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error("YouTube API key is not set");
      throw new Error("YouTube API key is not set");
    }

    console.log("Fetching video metadata for video ID:", videoId);
    const response = await retryOperation(() =>
      axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: "snippet",
          id: videoId,
          key: apiKey,
        },
      }),
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("No video data returned from YouTube API");
    }

    const videoData = response.data.items[0].snippet;
    const metadata = {
      title: videoData.title,
      description: videoData.description,
      thumbnailUrl: videoData.thumbnails.default.url,
    };
    console.log("Metadata fetched successfully:", {
      title: metadata.title,
      descriptionLength: metadata.description.length,
      thumbnailUrl: metadata.thumbnailUrl,
    });

    // Cache the metadata
    transcriptCache[videoId] = { data: metadata as any, timestamp: Date.now() };

    return metadata;
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    if (error instanceof AxiosError) {
      console.error("Axios error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw new TranscriptNotFoundError("Failed to fetch video metadata");
  }
}

export async function generateSummary(
  transcriptOrMetadata: string,
  language: string,
): Promise<string> {
  try {
    console.log(
      "Sending request to OpenRouter API, input length:",
      transcriptOrMetadata.length,
    );
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error("OpenRouter API key is not set");
      throw new Error("OpenRouter API key is not set");
    }

    const prompt = `
      Generate a comprehensive and well-structured summary of the following video content.
      Use this Markdown structure for better readability:

      # ${language === "es" ? "Resumen del Video" : "Video Summary"}

      ## ${language === "es" ? "Introducción" : "Introduction"}
      [2-3 sentences introducing the video's main topic]

      ## ${language === "es" ? "Puntos Principales" : "Main Points"}
      - **${language === "es" ? "Punto 1" : "Point 1"}**: [Brief explanation]
      - **${language === "es" ? "Punto 2" : "Point 2"}**: [Brief explanation]
      - **${language === "es" ? "Punto 3" : "Point 3"}**: [Brief explanation]

      ## ${language === "es" ? "Detalles Importantes" : "Key Details"}
      [Expand on the main points with supporting details]

      ## ${language === "es" ? "Conclusión" : "Conclusion"}
      [Summarize the key takeaways]

      Use **bold** for important terms and *italic* for emphasis.
      Include relevant quotes using > notation.
      
      Content: ${transcriptOrMetadata}
    `;

    const response = await retryOperation(() =>
      axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes video content.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.25,
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
          },
        },
      ),
    );

    console.log("API Response received, status:", response.status);

    if (
      !response.data ||
      !response.data.choices ||
      response.data.choices.length === 0
    ) {
      console.error(
        "Invalid API response structure:",
        JSON.stringify(response.data, null, 2),
      );
      throw new SummaryGenerationError("Invalid API response structure");
    }

    const summary = response.data.choices[0]?.message?.content?.trim();
    if (!summary) {
      console.error("Summary content is empty or undefined");
      throw new SummaryGenerationError("Summary content is empty or undefined");
    }
    console.log("Summary generated successfully, length:", summary.length);
    return summary;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Axios error:", error.message);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      console.error("Response headers:", error.response?.headers);
    } else if (error instanceof Error) {
      console.error("Error generating summary:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error generating summary:", error);
    }
    throw new SummaryGenerationError("Failed to generate summary");
  }
}

async function saveSummary(
  videoId: string,
  videoUrl: string,
  transcriptOrMetadata: string,
  content: string,
  userId: string,
  videoTitle: string,
  thumbnailUrl: string,
): Promise<void> {
  const supabase = createClient();
  try {
    console.log("Saving summary for video ID:", videoId);
    // Ensure the video exists in the database
    const dbVideoId = await ensureVideoExists(
      supabase,
      videoUrl,
      userId,
      videoTitle,
      thumbnailUrl,
    );
    console.log("Video ensured in database, ID:", dbVideoId);

    const { error } = await supabase.from("summaries").upsert(
      {
        video_id: dbVideoId,
        transcript: transcriptOrMetadata,
        content: content,
        user_id: userId,
        format: "unified",
        title: videoTitle,
      },
      {
        onConflict: "video_id,user_id",
      },
    );

    if (error) {
      console.error("Error upserting summary:", error);
      throw error;
    }
    console.log("Summary saved successfully");
  } catch (error) {
    console.error("Error saving summary:", error);
    throw new DatabaseInsertError("Failed to save summary");
  }
}

function extractYouTubeId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

async function extractFrames(videoUrl: string): Promise<string[]> {
  // Implementa la lógica para extraer fotogramas del video
  // Por ejemplo, usando fluent-ffmpeg
  const frames: string[] = [];
  // Lógica para extraer fotogramas y almacenarlos en el array 'frames'
  return frames;
}

export async function analyzeVideo(videoUrl: string): Promise<string> {
  const frames = await extractFrames(videoUrl);
  // Aquí puedes enviar los fotogramas a la API de OpenAI para análisis
  const analysisResults = await sendFramesToOpenAI(frames);
  return analysisResults;
}

async function sendFramesToOpenAI(frames: string[]): Promise<string> {
  // Implementa la lógica para enviar los fotogramas a la API de OpenAI
  // y recibir la respuesta
  const response = await fetch("https://api.openai.com/v1/your-endpoint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ frames }),
  });
  const data = await response.json();
  return data.result; // Ajusta según la estructura de la respuesta
}

interface VideoInfo {
  title: string;
  thumbnailUrl: string;
  duration: number;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YouTube API key is not set");
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found");
    }

    const videoData = data.items[0];
    const duration = parseDuration(videoData.contentDetails.duration);

    return {
      title: videoData.snippet.title,
      thumbnailUrl:
        videoData.snippet.thumbnails.high?.url ||
        videoData.snippet.thumbnails.default?.url,
      duration,
    };
  } catch (error) {
    logger.error("Error in getVideoInfo:", error);
    throw new Error("Failed to fetch video information");
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = match?.[1] ? parseInt(match[1]) : 0;
  const minutes = match?.[2] ? parseInt(match[2]) : 0;
  const seconds = match?.[3] ? parseInt(match[3]) : 0;

  return hours * 3600 + minutes * 60 + seconds;
}

export async function getVideoDetails(videoUrl: string) {
  const videoId = extractYouTubeId(videoUrl);
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const videoData = response.data.items[0].snippet;

    return {
      title: videoData.title,
      thumbnail: videoData.thumbnails.high.url,
    };
  } catch (error) {
    console.error("Error al obtener detalles del video:", error);
    throw error;
  }
}
