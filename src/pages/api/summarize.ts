import { NextRequest, NextResponse } from "next/server";
import { summarizeVideo } from "@/lib/videoProcessing";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
  DatabaseInsertError,
} from "@/lib/errors";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";

interface ErrorResponse {
  error: string;
  details?: string;
}

function createErrorResponse(
  message: string,
  details?: string,
  status: number = 500,
): NextResponse<ErrorResponse> {
  return NextResponse.json({ error: message, details }, { status });
}

function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

function extractYouTubeId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const runtime = "edge";

export default async function handler(req: NextRequest) {
  try {
    // Verificar límite de tasa
    const rateLimitResult = await rateLimit(req);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get URL parameters instead of JSON body
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get("url");
    const format = url.searchParams.get("format") || "unified";
    const language = url.searchParams.get("lang") || "en";
    const title = url.searchParams.get("title") || "";

    if (!videoUrl) {
      return createErrorResponse("URL is required", undefined, 400);
    }

    const supabase = getSupabase();
    const ip = req.ip ?? "::1";

    // Get or create user
    const { data: user, error: userError } = await supabase.rpc(
      "get_or_create_anonymous_user",
      {
        user_ip: ip,
        initial_quota: 5,
        initial_plan: "F",
      },
    );

    if (userError) {
      console.error("Error getting/creating user:", userError);
      return createErrorResponse("Error processing request");
    }

    if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
      return createErrorResponse(
        "Invalid YouTube URL",
        "Please provide a valid YouTube URL",
        400,
      );
    }

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      return createErrorResponse(
        "Invalid YouTube URL",
        "Unable to extract video ID from the URL",
        400,
      );
    }

    if (user.quota_remaining <= 0) {
      return createErrorResponse(
        "Quota exhausted",
        "You have reached your quota limit for video summaries",
        403,
      );
    }

    const { summary, transcript } = await summarizeVideo(videoUrl, language);

    if (!summary) {
      throw new SummaryGenerationError(
        "Failed to generate summary: Summary is null or empty",
      );
    }

    // Insert or update the video in the database
    const { data: insertedVideo, error: videoUpsertError } = await supabase
      .from("videos")
      .upsert({ id: videoId, url: videoUrl, user_id: user.id })
      .select()
      .single();

    if (videoUpsertError) {
      console.error("Failed to save video:", videoUpsertError);
      console.error(
        "Error details:",
        JSON.stringify(videoUpsertError, null, 2),
      );
      throw new DatabaseInsertError(
        `Failed to save video: ${videoUpsertError.message}`,
      );
    }
    // Insert the summary into the database
    const summaryInsert = {
      video_id: videoId,
      content: summary,
      transcript: transcript || "",
      user_id: user.id,
      format: format,
      title: title || videoUrl, // Use provided title or fallback to URL
    };

    const { data: insertedSummary, error: insertError } = await supabase
      .from("summaries")
      .upsert(
        summaryInsert as any,
        { onConflict: ["video_id", "user_id"] } as any,
      )
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save summary:", insertError);
      console.error("Error details:", JSON.stringify(insertError, null, 2));
      throw new DatabaseInsertError(
        `Failed to save summary: ${insertError.message}`,
      );
    }

    if (!insertedSummary) {
      throw new DatabaseInsertError("Failed to save summary: No data returned");
    }

    // After successful summary generation, decrease quota
    const { error: updateError } = await supabase
      .from("users")
      .update({
        quota_remaining: user.quota_remaining - 1,
        transcriptions_used: user.transcriptions_used + 1,
      })
      .eq("ip_address", ip);

    if (updateError) {
      console.error("Error updating quota:", updateError);
    }

    return NextResponse.json(
      {
        summary,
        transcript,
        videoId,
        quotaRemaining: user.quota_remaining - 1,
        redirectUrl: `/summary/${videoId}`,
      },
      {
        headers: {
          "Access-Control-Allow-Origin":
            "localhost:3000, 127.0.0.1:3000, resumyt.com",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  } catch (error) {
    if (error instanceof VideoFetchError) {
      return createErrorResponse(
        "Error al obtener el video",
        error.message,
        400,
      );
    } else if (error instanceof TranscriptNotFoundError) {
      return createErrorResponse(
        "Transcripción no encontrada",
        error.message,
        404,
      );
    } else if (error instanceof SummaryGenerationError) {
      return createErrorResponse(
        "Error al generar el resumen",
        error.message,
        500,
      );
    } else {
      return createErrorResponse(
        "Error inesperado",
        "Ocurrió un error interno",
        500,
      );
    }
  }
}
