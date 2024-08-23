import { createClient, ensureVideoExists } from "@/lib/supabase-server";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
  DatabaseInsertError,
} from "./errors";
import { YoutubeTranscript } from "youtube-transcript";
import axios, { AxiosError } from "axios";

export async function summarizeVideo(videoUrl: string): Promise<string> {
  try {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      throw new VideoFetchError("Invalid YouTube URL");
    }

    const transcriptOrMetadata = await transcribeVideoWithFallback(videoId);
    const summary = await generateSummary(transcriptOrMetadata);

    return summary;
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
  userId: string
): Promise<{ videoId: string; transcriptOrMetadata: string; summary: string }> {
  try {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      throw new VideoFetchError("Invalid YouTube URL");
    }

    const transcriptOrMetadata = await transcribeVideoWithFallback(videoId);
    const summary = await generateSummary(transcriptOrMetadata);
    await saveSummary(videoId, videoUrl, transcriptOrMetadata, summary, userId);

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

export async function transcribeVideoWithFallback(videoId: string): Promise<string> {
  try {
    console.log("Attempting to fetch transcript for video:", videoId);
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    console.log("Transcript fetched successfully");
    return transcriptArray.map((item) => item.text).join(" ");
  } catch (error) {
    console.error("Error fetching transcript:", error);
    console.log("Falling back to video metadata");
    return await fetchVideoMetadata(videoId);
  }
}

async function fetchVideoMetadata(videoId: string): Promise<string> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YouTube API key is not set");
    }

    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet',
        id: videoId,
        key: apiKey
      }
    });

    const videoData = response.data.items[0].snippet;
    return `Title: ${videoData.title}\n\nDescription: ${videoData.description}`;
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    throw new TranscriptNotFoundError("Failed to fetch video transcript and metadata");
  }
}

export async function generateSummary(transcriptOrMetadata: string): Promise<string> {
  try {
    console.log("Sending request to OpenRouter API...");
    const response = await axios.post(
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
            content: `Summarize the following content. If it's a transcript, summarize the video based on the transcript. If it's metadata (title and description), provide a summary based on that information:\n\n${transcriptOrMetadata}`,
          },
        ],
        max_tokens: 750,
        temperature: 0.25,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response:", JSON.stringify(response.data, null, 2));

    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new SummaryGenerationError("Invalid API response structure");
    }

    const summary = response.data.choices[0]?.message?.content?.trim();
    if (!summary) {
      throw new SummaryGenerationError("Summary content is empty or undefined");
    }
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
  userId: string
): Promise<void> {
  const supabase = createClient();
  try {
    // Ensure the video exists in the database
    const dbVideoId = await ensureVideoExists(supabase, videoUrl, userId);

    const { error } = await supabase.from("summaries").upsert(
      {
        video_id: dbVideoId,
        transcript: transcriptOrMetadata,
        content: content,
        user_id: userId,
      },
      {
        onConflict: "video_id,user_id",
      }
    );

    if (error) {
      throw error;
    }
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
