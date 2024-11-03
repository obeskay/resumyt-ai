import { NextRequest, NextResponse } from "next/server";
import { getVideoDetails } from "@/lib/videoProcessingNode";

export const runtime = "edge";

function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const videoUrl = url.searchParams.get("url");

    if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
      return NextResponse.json(
        { valid: false, error: "Invalid YouTube URL" },
        { status: 400 },
      );
    }

    // Get video details using the existing function
    const { title, thumbnail } = await getVideoDetails(videoUrl);

    return NextResponse.json({
      valid: true,
      title,
      thumbnail,
    });
  } catch (error) {
    console.error("Error validating video:", error);
    return NextResponse.json(
      {
        valid: false,
        error:
          "Could not fetch video information. Please check if the video exists and is public.",
      },
      { status: 400 },
    );
  }
}
