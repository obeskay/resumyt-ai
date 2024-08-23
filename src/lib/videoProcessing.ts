import { createClient, ensureVideoExists } from "@/lib/supabase-server";
import OpenAI from "openai";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
  DatabaseInsertError,
} from "./errors";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

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
    if (error instanceof VideoFetchError || error instanceof TranscriptNotFoundError || error instanceof SummaryGenerationError || error instanceof DatabaseInsertError) {
      throw error;
    }
    throw new VideoFetchError("Failed to process video");
  }
}

import { google } from 'googleapis';
import { getSubtitles } from 'youtube-transcript-api';

export async function transcribeVideo(videoId: string): Promise<string> {
  try {
    // First, try to get the transcript using the YouTube API
    const transcript = await getTranscriptFromYouTubeAPI(videoId);
    
    if (transcript) {
      return transcript;
    }

    // If YouTube API fails, fall back to youtube-transcript-api
    const fallbackTranscript = await getTranscriptFromYouTubeTranscriptAPI(videoId);
    
    if (fallbackTranscript) {
      return fallbackTranscript;
    }

    throw new TranscriptNotFoundError("Failed to generate transcript");
  } catch (error) {
    console.error("Error transcribing video:", error);
    throw new TranscriptNotFoundError("Failed to transcribe video");
  }
}

async function getTranscriptFromYouTubeAPI(videoId: string): Promise<string | null> {
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });

  try {
    const response = await youtube.captions.list({
      part: ['snippet'],
      videoId: videoId,
    });

    if (response.data.items && response.data.items.length > 0) {
      const captionId = response.data.items[0].id;
      if (captionId) {
        const transcript = await youtube.captions.download({
          id: captionId,
        });
        return transcript.data as string;
      }
    }
  } catch (error) {
    console.error("Error fetching transcript from YouTube API:", error);
  }

  return null;
}

async function getTranscriptFromYouTubeTranscriptAPI(videoId: string): Promise<string | null> {
  try {
    const transcriptArray = await getSubtitles({ videoID: videoId, lang: 'en' });
    return transcriptArray.map(item => item.text).join(' ');
  } catch (error) {
    console.error("Error fetching transcript from youtube-transcript-api:", error);
    return null;
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
