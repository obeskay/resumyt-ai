import { createClient, ensureVideoExists } from "@/lib/supabase-server";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
  DatabaseInsertError,
} from "./errors";
import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";

export async function summarizeVideo(videoUrl: string): Promise<string> {
  try {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      throw new VideoFetchError("Invalid YouTube URL");
    }

    const transcript = await transcribeVideo(videoId);
    const summary = await generateSummary(transcript);

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
): Promise<{ videoId: string; transcript: string; summary: string }> {
  try {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      throw new VideoFetchError("Invalid YouTube URL");
    }

    const transcript = await transcribeVideo(videoId);
    const summary = await generateSummary(transcript);
    await saveSummary(videoId, videoUrl, transcript, summary, userId);

    return { videoId, transcript, summary };
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

export async function transcribeVideo(videoId: string): Promise<string> {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    return transcriptArray.map((item) => item.text).join(" ");
  } catch (error) {
    console.error("Error transcribing video:", error);
    throw new TranscriptNotFoundError("Failed to transcribe video");
  }
}

export async function generateSummary(transcript: string): Promise<string> {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes video transcripts.",
          },
          {
            role: "user",
            content: `Summarize the following transcript of video, don't mention the transcript neither the process:\n\n${transcript}`,
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

    const summary = response.data.choices[0]?.message?.content?.trim();
    if (!summary) {
      throw new SummaryGenerationError("Failed to generate summary");
    }
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new SummaryGenerationError("Failed to generate summary");
  }
}

async function saveSummary(
  videoId: string,
  videoUrl: string,
  transcript: string,
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
        transcript: transcript,
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
