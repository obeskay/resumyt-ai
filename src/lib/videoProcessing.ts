import { createClient } from "@/lib/supabase-server";
import OpenAI from "openai";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
} from "./errors";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function processVideo(
  videoUrl: string,
  userId: string
): Promise<{ videoId: string; transcript: string; summary: string }> {
  const supabase = createClient();
  try {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      throw new VideoFetchError("Invalid YouTube URL");
    }

    const transcript = await transcribeVideo(videoId);
    const summary = await generateSummary(transcript);
    await saveSummary(videoId, transcript, summary, userId);

    return { videoId, transcript, summary };
  } catch (error) {
    console.error("Error processing video:", error);
    throw new VideoFetchError("Failed to process video");
  }
}

export async function transcribeVideo(videoId: string): Promise<string> {
  try {
    // Here you would implement the actual video transcription logic
    // For now, we'll return a sample transcript
    const transcript = `This is a sample transcript for video ${videoId}. In a real implementation, this would contain the actual transcription of the video content.`;
    if (!transcript) {
      throw new TranscriptNotFoundError("Failed to generate transcript");
    }
    return transcript;
  } catch (error) {
    console.error("Error transcribing video:", error);
    throw new TranscriptNotFoundError("Failed to transcribe video");
  }
}

export async function generateSummary(transcript: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes video transcripts.",
        },
        {
          role: "user",
          content: `Summarize the following transcript:\n\n${transcript}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    const summary = response.choices[0]?.message?.content?.trim();
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
  transcript: string,
  content: string,
  userId: string
): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("summaries").upsert(
      {
        video_id: videoId,
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
    throw new Error("Failed to save summary");
  }
}

function extractYouTubeId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
