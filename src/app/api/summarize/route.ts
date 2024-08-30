import { NextRequest, NextResponse } from "next/server";
import { summarizeVideo } from "@/lib/videoProcessing";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
  DatabaseInsertError,
  DatabaseUpdateError,
} from "@/lib/errors";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";
import { Database } from "@/types/supabase";
import { logger } from "@/lib/logger"; // Asegúrate de crear este módulo

interface ErrorResponse {
  error: string;
  details?: string;
}

function createErrorResponse(
  message: string,
  details?: string,
  status: number = 500
): NextResponse<ErrorResponse> {
  logger.error(`Error: ${message}${details ? ` - ${details}` : ""}`);
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

export async function POST(req: NextRequest) {
  try {
    logger.info("API route started");

    // Check rate limit
    const rateLimitResult = await rateLimit(req);
    if (rateLimitResult) {
      logger.info("Rate limit exceeded");
      return rateLimitResult;
    }

    const { videoUrl, summaryFormat } = await req.json();
    logger.info(`Received request for video: ${videoUrl}, format: ${summaryFormat}`);

    if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
      logger.info("Invalid YouTube URL provided");
      return createErrorResponse(
        "Invalid YouTube URL",
        "Please provide a valid YouTube URL",
        400
      );
    }

    if (!summaryFormat || !['bullet-points', 'paragraph', 'page'].includes(summaryFormat)) {
      logger.info("Invalid summary format provided");
      return createErrorResponse(
        "Invalid summary format",
        "Please provide a valid summary format (bullet-points, paragraph, or page)",
        400
      );
    }

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      logger.info("Failed to extract video ID");
      return createErrorResponse(
        "Invalid YouTube URL",
        "Unable to extract video ID from the URL",
        400
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.ip || "unknown";
    logger.info(`Request IP: ${ipAddress}`);

    const supabase = getSupabase();
    logger.info("Supabase client initialized");

    // Check user's quota
    const { data: user, error: userError } = await supabase
      .from("anonymous_users")
      .select("id, quota_remaining")
      .eq("ip_address", ipAddress)
      .single();

    if (!supabase) {
      logger.error("Failed to initialize Supabase client");
      return createErrorResponse("Internal server error", "Database connection failed", 500);
    }

    if (!user || typeof user.id === 'undefined' || typeof user.quota_remaining === 'undefined') {
      logger.error("Invalid user data:", user);
      return createErrorResponse("Internal server error", "Invalid user data", 500);
    }

    logger.info(`User quota remaining: ${user.quota_remaining}`);

    if (user.quota_remaining <= 0) {
      logger.info("User quota exhausted");
      return createErrorResponse(
        "Quota exhausted",
        "You have reached your quota limit for video summaries",
        403
      );
    }

    logger.info("Attempting to summarize video:", videoUrl);
    const { summary, transcript } = await summarizeVideo(videoUrl, summaryFormat);
    logger.info("Summary generated successfully, length:", summary.length);

    if (!summary) {
      logger.error("Generated summary is null or empty");
      throw new SummaryGenerationError(
        "Failed to generate summary: Summary is null or empty"
      );
    }

    // Update the user's quota
    const { error: updateError } = await supabase
      .from("anonymous_users")
      .update({ quota_remaining: user.quota_remaining - 1 })
      .eq("id", user.id);

    if (updateError) {
      logger.error("Failed to update user quota:", updateError);
      throw new DatabaseUpdateError("Failed to update user quota");
    }

    logger.info("User quota updated successfully");

    // Insert or update the video in the database
    const { data: insertedVideo, error: videoUpsertError } = await supabase
      .from("videos")
      .upsert({ id: videoId, url: videoUrl, user_id: user.id })
      .select()
      .single();

    if (videoUpsertError) {
      logger.error("Failed to save video:", videoUpsertError);
      logger.error(
        "Error details:",
        JSON.stringify(videoUpsertError, null, 2)
      );
      throw new DatabaseInsertError(
        `Failed to save video: ${videoUpsertError.message}`
      );
    }

    logger.info("Video saved successfully:", insertedVideo);

    // Insert the summary into the database
    const summaryInsert: Omit<Database["public"]["Tables"]["summaries"]["Insert"], "format"> & { format: string } = {
      video_id: videoId,
      content: summary,
      transcript: transcript || "",
      user_id: user.id,
      format: summaryFormat,
    };

    logger.info(
      "Attempting to insert summary:",
      JSON.stringify(summaryInsert, null, 2)
    );

    const { data: insertedSummary, error: insertError } = await supabase
      .from("summaries")
      .upsert(
        summaryInsert as any,
        { onConflict: ["video_id", "user_id"] } as any
      )
      .select()
      .single();

    if (insertError) {
      logger.error("Failed to save summary:", insertError);
      logger.error("Error details:", JSON.stringify(insertError, null, 2));
      throw new DatabaseInsertError(
        `Failed to save summary: ${insertError.message}`
      );
    }

    if (!insertedSummary) {
      logger.error("No summary data returned after insertion");
      throw new DatabaseInsertError("Failed to save summary: No data returned");
    }

    logger.info("Summary inserted successfully:", insertedSummary);

    logger.info("API route completed successfully");
    return NextResponse.json({
      summary,
      transcript,
      videoId,
      quotaRemaining: user.quota_remaining - 1,
    });
  } catch (error) {
    logger.error("Error in summarize API:", error);

    if (error instanceof VideoFetchError) {
      return createErrorResponse("Failed to fetch video", error.message, 400);
    } else if (error instanceof TranscriptNotFoundError) {
      return createErrorResponse(
        "Failed to transcribe video",
        error.message,
        400
      );
    } else if (error instanceof SummaryGenerationError) {
      return createErrorResponse(
        "Failed to generate summary",
        error.message,
        500
      );
    } else if (error instanceof DatabaseInsertError) {
      return createErrorResponse("Failed to save data", error.message, 500);
    } else if (error instanceof DatabaseUpdateError) {
      return createErrorResponse("Failed to update data", error.message, 500);
    } else if (error instanceof Error) {
      return createErrorResponse("An unexpected error occurred", error.message);
    }

    return createErrorResponse("An unknown error occurred");
  } finally {
    logger.info("API route completed");
  }
}
