import { NextRequest, NextResponse } from "next/server";
import {
  TranscriptNotFoundError,
  SummaryGenerationError,
  UserFetchError,
  VideoFetchError,
  SummaryFetchError,
  DatabaseInsertError,
  DatabaseUpdateError,
} from "@/lib/errors";
import { processVideo, generateSummary } from "@/lib/videoProcessing";
import { rateLimit } from "@/lib/rateLimit";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const result = await rateLimit(req);
    if (result) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const { videoUrl, userId } = await req.json();

    if (!videoUrl || !userId) {
      return NextResponse.json(
        { error: "Missing videoUrl or userId" },
        { status: 400 }
      );
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, quota_remaining")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new UserFetchError("Failed to fetch user data");
    }

    if (user.quota_remaining <= 0) {
      return NextResponse.json(
        { error: "User quota exceeded" },
        { status: 403 }
      );
    }

    // Process video
    const { videoId, transcript } = await processVideo(videoUrl);

    if (!transcript) {
      throw new TranscriptNotFoundError("Failed to generate transcript");
    }

    // Generate summary
    const summary = await generateSummary(transcript);

    if (!summary) {
      throw new SummaryGenerationError("Failed to generate summary");
    }

    // Update database
    const { error: insertError } = await supabase
      .from("videos")
      .insert({ user_id: userId, video_url: videoUrl, transcript, summary });

    if (insertError) {
      throw new DatabaseInsertError("Failed to insert video data");
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ quota_remaining: user.quota_remaining - 1 })
      .eq("id", userId);

    if (updateError) {
      throw new DatabaseUpdateError("Failed to update user quota");
    }

    return NextResponse.json({ summary, transcript });
  } catch (error) {
    console.error("Error in video processing:", error);
    if (
      error instanceof TranscriptNotFoundError ||
      error instanceof SummaryGenerationError ||
      error instanceof UserFetchError ||
      error instanceof VideoFetchError ||
      error instanceof SummaryFetchError ||
      error instanceof DatabaseInsertError ||
      error instanceof DatabaseUpdateError
    ) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
