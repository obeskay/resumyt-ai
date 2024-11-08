import { createClient } from "@/lib/supabase-server";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
  DatabaseInsertError,
} from "./errors";
import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";

import OpenAI from "openai";
import { VideoSummary, ProcessedVideo } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

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
  language: string = "es",
): Promise<{ summary: VideoSummary; transcript: string }> {
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

    // Ensure we're passing a valid language code
    const validLanguage = language.substring(0, 2).toLowerCase();
    const summary = await generateSummary(transcriptOrMetadata, validLanguage);

    if (!summary) {
      console.error("Generated summary is null or undefined");
      throw new SummaryGenerationError(
        "Failed to generate summary: Summary is null",
      );
    }

    console.log("Summary generated successfully:", {
      introLength: summary.introduction.length,
      pointsCount: summary.mainPoints.length,
      conclusionsLength: summary.conclusions.length,
    });

    return {
      summary,
      transcript: transcriptOrMetadata,
    };
  } catch (error) {
    console.error("Error in summarizeVideo:", error);
    if (
      error instanceof VideoFetchError ||
      error instanceof TranscriptNotFoundError ||
      error instanceof SummaryGenerationError
    ) {
      throw error;
    }
    throw new VideoFetchError(
      `Failed to summarize video: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?format=json&url=http://www.youtube.com/watch?v=${videoId}`,
    );
    const data = await response.json();
    return data.title || "Untitled Video";
  } catch (error) {
    console.error("Error fetching video title:", error);
    return "Untitled Video";
  }
}

export async function processVideo(
  videoUrl: string,
  userId: string,
  videoTitle?: string,
): Promise<ProcessedVideo> {
  try {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      throw new VideoFetchError("Invalid YouTube URL");
    }

    const title = videoTitle || (await getVideoTitle(videoId));
    const transcriptOrMetadata = await transcribeVideoWithFallback(videoId);
    const summary = await generateSummary(transcriptOrMetadata, "es");
    const { thumbnailUrl } = await fetchVideoMetadata(videoId);

    await saveSummary(
      videoId,
      videoUrl,
      transcriptOrMetadata,
      JSON.stringify(summary),
      userId,
      "structured",
      title,
    );

    return {
      videoId,
      title,
      url: videoUrl,
      summary,
      transcript: transcriptOrMetadata,
      thumbnailUrl,
    };
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
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
    const cachedTranscript = transcriptCache[videoId].data;
    return preprocessTranscript(cachedTranscript);
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
      transcript = transcriptArray
        .map((item: any) => item.text.trim())
        .filter((text: string) => text.length > 0)
        .join(" ");
    } catch (ytError) {
      console.log(
        "Error con YoutubeTranscript, intentando con la API de YouTube:",
        ytError,
      );
      transcript = await fetchYouTubeSubtitles(videoId);
    }

    // Preprocesar la transcripción antes de cachearla
    const processedTranscript = preprocessTranscript(transcript);

    // Validar la transcripción
    if (!validateTranscript(processedTranscript)) {
      throw new TranscriptNotFoundError(
        "La transcripción no es válida o está incompleta",
      );
    }

    // Cachear la transcripción procesada
    transcriptCache[videoId] = {
      data: processedTranscript,
      timestamp: Date.now(),
    };

    return processedTranscript;
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

// Nueva función para preprocesar la transcripción
function preprocessTranscript(transcript: string): string {
  return (
    transcript
      // Eliminar caracteres especiales y símbolos innecesarios
      .replace(/[\[\]{}()*+?.,\\^$|#\s]/g, " ")
      // Eliminar espacios múltiples
      .replace(/\s+/g, " ")
      // Eliminar saltos de línea
      .replace(/\n+/g, " ")
      // Eliminar timestamps si existen
      .replace(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g, "")
      .trim()
  );
}

// Nueva función para validar la transcripción
function validateTranscript(transcript: string): boolean {
  // Verificar longitud mínima
  if (transcript.length < 50) return false;

  // Verificar que no sea solo números o caracteres especiales
  const textContent = transcript.replace(/[^a-zA-Z\u00C0-\u00FF]/g, "");
  if (textContent.length < transcript.length * 0.5) return false;

  // Verificar que no haya secuencias repetitivas
  const words = transcript.split(" ");
  const uniqueWords = new Set(words);
  if (uniqueWords.size < words.length * 0.3) return false;

  return true;
}

async function fetchVideoMetadata(
  videoId: string,
): Promise<{ title: string; thumbnailUrl: string; description: string }> {
  try {
    // Primero intentar con oEmbed
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    );

    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      return {
        title: oembedData.title,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description: oembedData.author_name
          ? `Video by ${oembedData.author_name}`
          : "",
      };
    }

    // Si oEmbed falla, intentar scraping
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();

    // Extraer título usando regex
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch
      ? titleMatch[1].replace(" - YouTube", "")
      : "Untitled Video";

    // Extraer descripción (opcional)
    const descriptionMatch = html.match(/"description":{"simpleText":"(.*?)"/);
    const description = descriptionMatch ? descriptionMatch[1] : "";

    return {
      title,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      description,
    };
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    // Fallback con datos mínimos
    return {
      title: "Untitled Video",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      description: "",
    };
  }
}

async function generateSummary(
  transcriptOrMetadata: string,
  language: string = "es",
): Promise<VideoSummary> {
  try {
    const processedTranscript = preprocessTranscript(transcriptOrMetadata);

    // Early validation
    if (!processedTranscript || processedTranscript.length < 50) {
      throw new SummaryGenerationError("Transcript too short or invalid");
    }

    // Limit transcript length if too long (OpenAI has token limits)
    const maxLength = 4000;
    const truncatedTranscript =
      processedTranscript.length > maxLength
        ? processedTranscript.substring(0, maxLength) + "..."
        : processedTranscript;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // Changed from gpt-4o-mini to gpt-4
      messages: [
        {
          role: "system",
          content: getSystemPromptForLanguage(language),
        },
        {
          role: "user",
          content: getUserPromptForLanguage(language, truncatedTranscript),
        },
      ],
      temperature: 0.5, // Reduced for more consistent outputs
      response_format: { type: "json_object" },
    });

    console.log("\n\n\n\n\n\n\n\n");
    const responseContent = completion.choices[0]?.message?.content;
    console.log("responseContent:", responseContent);

    if (!responseContent) {
      throw new SummaryGenerationError("Empty response from OpenAI");
    }

    let summary: VideoSummary;
    try {
      summary = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new SummaryGenerationError("Invalid JSON in summary response");
    }

    // Enhanced validation
    if (!isValidSummary(summary)) {
      console.error("Invalid summary structure:", summary);
      throw new SummaryGenerationError("Summary structure is invalid");
    }

    // Ensure mainPoints has at least one item
    if (!summary.mainPoints.length) {
      throw new SummaryGenerationError("No main points in summary");
    }

    return {
      introduction: summary.introduction.trim(),
      mainPoints: summary.mainPoints.map((point) => ({
        id: point.id,
        point: point.point.trim(),
      })),
      conclusions: summary.conclusions.trim(),
    };
  } catch (error) {
    console.error("Error in generateSummary:", error);

    // Create a fallback summary if possible
    if (transcriptOrMetadata.length > 0) {
      return {
        introduction: "Could not generate detailed summary.",
        mainPoints: [
          {
            id: 1,
            point: transcriptOrMetadata.substring(0, 200) + "...",
          },
        ],
        conclusions: "Please try again later.",
      };
    }

    throw new SummaryGenerationError(
      `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Enhanced validation function
function isValidSummary(summary: any): summary is VideoSummary {
  return (
    summary &&
    typeof summary === "object" &&
    typeof summary.introduction === "string" &&
    Array.isArray(summary.mainPoints) &&
    summary.mainPoints.length > 0 &&
    summary.mainPoints.every(
      (point: any) =>
        typeof point === "object" &&
        typeof point.id === "number" &&
        typeof point.point === "string" &&
        point.point.length > 0,
    ) &&
    typeof summary.conclusions === "string" &&
    summary.conclusions.length > 0
  );
}

// Updated system prompt function
function getSystemPromptForLanguage(language: string): string {
  const prompts = {
    es: `Eres un asistente especializado en crear resúmenes concisos y estructurados de videos.
        Analiza el contenido y genera un resumen en formato JSON que incluya:
        1. Una introducción breve pero informativa, con negrita en conceptos clave
        2. 3-5 puntos principales que capturen las ideas más importantes, con subtítulos descriptivos
        3. Una conclusión que resuma los aprendizajes clave, resaltando recomendaciones
        
        Usa las siguientes convenciones de formato:
        - **texto** para negrita
        - # para títulos principales
        - ## para subtítulos
        - • para viñetas
        
        El formato debe ser EXACTAMENTE:
        {
          "introduction": "string con **palabras clave** en negrita",
          "mainPoints": [
            { "id": number, "title": "string", "point": "string con **énfasis** donde corresponda" }
          ],
          "conclusions": "string con **recomendaciones** destacadas"
        }`,
    en: `You are an assistant specialized in creating concise, structured video summaries.
        Analyze the content and generate a JSON summary that includes:
        1. A brief but informative introduction, with key concepts in bold
        2. 3-5 main points capturing the most important ideas, with descriptive subtitles
        3. A conclusion summarizing key takeaways, highlighting recommendations
        
        Use the following formatting conventions:
        - **text** for bold
        - # for main titles
        - ## for subtitles
        - • for bullet points
        
        The format must be EXACTLY:
        {
          "introduction": "string with **key words** in bold",
          "mainPoints": [
            { "id": number, "title": "string", "point": "string with **emphasis** where appropriate" }
          ],
          "conclusions": "string with **recommendations** highlighted"
        }`,
  };
  return prompts[language as keyof typeof prompts] || prompts.en;
}

function getUserPromptForLanguage(
  language: string,
  transcript: string,
): string {
  const prompts = {
    es: `Analiza el siguiente contenido de video y genera un resumen detallado en español:
        ${transcript}
        Estructura el resumen incluyendo:
        - Una introducción completa que explique el contexto
        - Los puntos principales claramente identificados con "-"
        - Conclusiones relevantes y aplicables`,
    en: `Analyze the following video content and generate a detailed summary in English:
        ${transcript}
        Structure the summary including:
        - A complete introduction explaining the context
        - Main points clearly identified with "-"
        - Relevant and applicable conclusions`,
    zh: `分析以下视频内容并用中文生成详细摘要：
        ${transcript}
        摘要结构包括：
        - 完整说明背景的引言
        - 用"-"清晰标识的主要观点
        - 相关且可应用的结论`,
    // Add more languages as needed
  };
  return prompts[language as keyof typeof prompts] || prompts.en;
}

async function saveSummary(
  videoId: string,
  videoUrl: string,
  transcriptOrMetadata: string,
  content: string,
  userId: string,
  format: string,
  videoTitle: string,
): Promise<void> {
  const supabase = createClient();
  try {
    // Primero intentamos obtener el título del video
    const title = videoTitle || "Untitled Video";

    // Primero insertamos o actualizamos el video
    const { error: videoError } = await supabase.from("videos").upsert(
      {
        id: videoId,
        url: videoUrl,
        title: title,
      },
      { onConflict: "id" },
    );

    if (videoError) {
      console.error("Error saving video:", videoError);
      throw videoError;
    }

    // Luego guardamos el resumen
    const { error: summaryError } = await supabase.from("summaries").upsert(
      {
        video_id: videoId,
        transcript: transcriptOrMetadata,
        content: content,
        user_id: userId,
        format: format,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "video_id,user_id",
      },
    );

    if (summaryError) {
      console.error("Error saving summary:", summaryError);
      throw summaryError;
    }
  } catch (error) {
    console.error("Error in saveSummary:", error);
    throw new DatabaseInsertError("Failed to save summary");
  }
}

export function extractYouTubeId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

async function extractFrames(videoUrl: string): Promise<string[]> {
  const ffmpeg = require("fluent-ffmpeg");
  const frames: string[] = [];
  const maxFrames = 50; // Limit number of frames to process
  let frameCount = 0;

  return new Promise((resolve, reject) => {
    ffmpeg(videoUrl)
      .on("error", (err: Error) => {
        console.error("Error extracting frames:", err);
        reject(err);
      })
      // Extract 1 frame every 10 seconds
      .outputOptions(["-vf", "fps=1/10", "-frames:v", maxFrames.toString()])
      .on("frame", (buffer: Buffer) => {
        if (frameCount < maxFrames) {
          try {
            // Compress and resize frame before converting to base64
            const compressedBuffer = buffer; // Add image compression here if needed
            frames.push(compressedBuffer.toString("base64"));
            frameCount++;
          } catch (err) {
            console.error("Error processing frame:", err);
          }
        }
      })
      .on("end", () => {
        console.log(`Extracted ${frames.length} frames`);
        resolve(frames);
      })
      .toFormat("image2")
      .saveToFile(`temp/frame-%d.jpg`); // Save frames temporarily

    setTimeout(
      () => {
        reject(new Error("Frame extraction timed out"));
      },
      5 * 60 * 1000,
    ); // 5 minute timeout
  });
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
