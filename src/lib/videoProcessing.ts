import { createClient, ensureVideoExists } from "@/lib/supabase-server";
import {
  VideoFetchError,
  TranscriptNotFoundError,
  SummaryGenerationError,
  DatabaseInsertError,
} from "./errors";
import { YoutubeTranscript } from "youtube-transcript";
import axios, { AxiosError } from "axios";

// Simple in-memory cache for transcripts and metadata
const transcriptCache: { [key: string]: { data: string, timestamp: number } } = {};
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000)); // Exponential backoff
    }
  }
  throw new Error("Max retries reached");
}

export async function summarizeVideo(videoUrl: string, summaryFormat: 'bullet-points' | 'paragraph' | 'page'): Promise<{ summary: string, transcript: string }> {
  try {
    console.log('Starting summarizeVideo for URL:', videoUrl);
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      console.error('Invalid YouTube URL:', videoUrl);
      throw new VideoFetchError("Invalid YouTube URL");
    }
    console.log('Extracted video ID:', videoId);

    const transcriptOrMetadata = await transcribeVideoWithFallback(videoId);
    console.log('Transcript or metadata retrieved, length:', transcriptOrMetadata.length);

    const summary = await generateSummary(transcriptOrMetadata, summaryFormat);
    console.log('Summary generated, length:', summary.length);

    if (!summary) {
      console.error('Generated summary is null or empty');
      throw new SummaryGenerationError("Failed to generate summary: Summary is null or empty");
    }

    return { summary, transcript: transcriptOrMetadata };
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
  userId: string,
  summaryFormat: 'bullet-points' | 'paragraph' | 'page'
): Promise<{ videoId: string; transcriptOrMetadata: string; summary: string }> {
  try {
    console.log('Starting processVideo for URL:', videoUrl);
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      console.error('Invalid YouTube URL:', videoUrl);
      throw new VideoFetchError("Invalid YouTube URL");
    }
    console.log('Extracted video ID:', videoId);

    const transcriptOrMetadata = await transcribeVideoWithFallback(videoId);
    console.log('Transcript or metadata retrieved, length:', transcriptOrMetadata.length);

    const summary = await generateSummary(transcriptOrMetadata, summaryFormat);
    console.log('Summary generated, length:', summary.length);

    if (!summary) {
      console.error('Generated summary is null or empty');
      throw new SummaryGenerationError("Failed to generate summary: Summary is null or empty");
    }

    await saveSummary(videoId, videoUrl, transcriptOrMetadata, summary, userId, summaryFormat);
    console.log('Summary saved successfully');

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
  // Check cache first
  if (transcriptCache[videoId] && (Date.now() - transcriptCache[videoId].timestamp) < CACHE_EXPIRATION) {
    console.log('Transcript found in cache for video ID:', videoId);
    return transcriptCache[videoId].data;
  }

  try {
    console.log("Attempting to fetch transcript for video:", videoId);
    const transcriptArray = await retryOperation(() => YoutubeTranscript.fetchTranscript(videoId));
    console.log("Transcript fetched successfully, number of entries:", transcriptArray.length);
    const transcript = transcriptArray.map((item) => item.text).join(" ");
    console.log("Combined transcript length:", transcript.length);
    
    // Cache the transcript
    transcriptCache[videoId] = { data: transcript, timestamp: Date.now() };
    
    return transcript;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    console.log("Falling back to video metadata for video ID:", videoId);
    try {
      return await fetchVideoMetadata(videoId);
    } catch (metadataError) {
      console.error("Error fetching video metadata:", metadataError);
      throw new TranscriptNotFoundError("Failed to fetch both transcript and metadata");
    }
  }
}

async function fetchVideoMetadata(videoId: string): Promise<string> {
  // Check cache first
  if (transcriptCache[videoId] && (Date.now() - transcriptCache[videoId].timestamp) < CACHE_EXPIRATION) {
    console.log('Metadata found in cache for video ID:', videoId);
    return transcriptCache[videoId].data;
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error("YouTube API key is not set");
      throw new Error("YouTube API key is not set");
    }

    console.log("Fetching video metadata for video ID:", videoId);
    const response = await retryOperation(() => 
      axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: 'snippet',
          id: videoId,
          key: apiKey
        }
      })
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("No video data returned from YouTube API");
    }

    const videoData = response.data.items[0].snippet;
    const metadata = `Title: ${videoData.title}\n\nDescription: ${videoData.description}`;
    console.log("Metadata fetched successfully, length:", metadata.length);
    
    // Cache the metadata
    transcriptCache[videoId] = { data: metadata, timestamp: Date.now() };
    
    return metadata;
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    if (error instanceof AxiosError) {
      console.error("Axios error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw new TranscriptNotFoundError("Failed to fetch video metadata");
  }
}

export async function generateSummary(transcriptOrMetadata: string, summaryFormat: 'bullet-points' | 'paragraph' | 'page'): Promise<string> {
  try {
    console.log("Sending request to OpenRouter API, input length:", transcriptOrMetadata.length);
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error("OpenRouter API key is not set");
      throw new Error("OpenRouter API key is not set");
    }

    let promptInstructions = "";
    switch (summaryFormat) {
      case 'bullet-points':
        promptInstructions = "Provide a summary in the form of bullet points. Each point should be concise and cover a key idea or fact from the content.";
        break;
      case 'paragraph':
        promptInstructions = "Provide a summary in the form of a single, cohesive paragraph. The summary should flow naturally and cover the main points of the content.";
        break;
      case 'page':
        promptInstructions = "Provide a detailed summary, approximately one page in length. The summary should be comprehensive, covering all major points and some supporting details from the content. Organize the summary into paragraphs for better readability.";
        break;
    }

    const response = await retryOperation(() =>
      axios.post(
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
              content: `${promptInstructions}\n\nHere's the content to summarize. If it's a transcript, summarize the video based on the transcript. If it's metadata (title and description), provide a summary based on that information:\n\n${transcriptOrMetadata}`,
            },
          ],
          max_tokens: summaryFormat === 'page' ? 1500 : 750,
          temperature: 0.25,
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
          },
        }
      )
    );

    console.log("API Response received, status:", response.status);

    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error("Invalid API response structure:", JSON.stringify(response.data, null, 2));
      throw new SummaryGenerationError("Invalid API response structure");
    }

    const summary = response.data.choices[0]?.message?.content?.trim();
    if (!summary) {
      console.error("Summary content is empty or undefined");
      throw new SummaryGenerationError("Summary content is empty or undefined");
    }
    console.log("Summary generated successfully, length:", summary.length);
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
  userId: string,
  summaryFormat: 'bullet-points' | 'paragraph' | 'page'
): Promise<void> {
  const supabase = createClient();
  try {
    console.log("Saving summary for video ID:", videoId);
    // Ensure the video exists in the database
    const dbVideoId = await ensureVideoExists(supabase, videoUrl, userId);
    console.log("Video ensured in database, ID:", dbVideoId);

    const { error } = await supabase.from("summaries").upsert(
      {
        video_id: dbVideoId,
        transcript: transcriptOrMetadata,
        content: content,
        user_id: userId,
        format: summaryFormat,
      },
      {
        onConflict: "video_id,user_id",
      }
    );

    if (error) {
      console.error("Error upserting summary:", error);
      throw error;
    }
    console.log("Summary saved successfully");
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
