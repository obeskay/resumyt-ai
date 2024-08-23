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
import { processVideo } from "@/lib/videoProcessing";
import { rateLimit } from "@/lib/rateLimit";
import { getSupabase, getOrCreateAnonymousUser } from "@/lib/supabase";

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

    const { videoUrl } = await req.json();
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Missing videoUrl" },
        { status: 400 }
      );
    }

    // Get or create anonymous user
    const user = await getOrCreateAnonymousUser(ip);

    if (!user) {
      throw new UserFetchError("Failed to get or create anonymous user");
    }

    // Check quota
    if (user.transcriptions_used >= 3) {
      return NextResponse.json(
        { error: "User quota exceeded" },
        { status: 403 }
      );
    }

    // Process video
    const { videoId, transcript, summary } = await processVideo(videoUrl, user.id);

    if (!transcript || !summary) {
      throw new SummaryGenerationError("Failed to generate transcript or summary");
    }

    // Update user quota
    const supabase = getSupabase();
    const { error: updateError } = await supabase
      .from("anonymous_users")
      .update({ transcriptions_used: user.transcriptions_used + 1 })
      .eq("id", user.id);

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
