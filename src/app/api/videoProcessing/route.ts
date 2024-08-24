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
    const rateLimitResult = await rateLimit(req);
    if (rateLimitResult) {
      return rateLimitResult;
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

    // Process video
    const { videoId, transcriptOrMetadata, summary } = await processVideo(videoUrl, user.id);

    if (!transcriptOrMetadata || !summary) {
      throw new SummaryGenerationError("Failed to generate transcript or summary");
    }

    return NextResponse.json({ summary, transcript: transcriptOrMetadata });
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
