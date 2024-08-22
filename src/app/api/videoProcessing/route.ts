import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import { rateLimit } from '@/lib/rateLimit';
import {
  TranscriptNotFoundError,
  SummaryGenerationError,
  UserFetchError,
  VideoFetchError,
  SummaryFetchError,
  DatabaseInsertError,
  DatabaseUpdateError
} from '@/lib/errors';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
  const rateLimitResult = rateLimit(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  const { vid, userId } = await req.json();

  if (!vid || typeof vid !== 'string' || !userId) {
    return NextResponse.json({ message: 'Missing or invalid video ID or user ID' }, { status: 400 });
  }

  try {
    // Get or create the user in the database
    const { data: user, error: userError } = await supabase
      .from('anonymous_users')
      .upsert({ id: userId, transcriptions_used: 0 })
      .select()
      .single();

    if (userError) {
      throw new UserFetchError('Unable to retrieve or create user');
    }

    // Check if the user has exceeded the free transcription limit
    if (user.transcriptions_used >= 3) {
      return NextResponse.json({ message: 'Free transcription limit exceeded' }, { status: 403 });
    }


    // Check if video exists in the database
    let { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id')
      .eq('url', `https://www.youtube.com/watch?v=${vid}`)
      .single();

    if (videoError && videoError.code !== 'PGRST116') {
      throw new VideoFetchError('Error checking existing video');
    }

    let videoId: number;

    if (!video) {
      // If video doesn't exist, insert it
      const { data: newVideo, error: insertError } = await supabase
        .from('videos')
        .insert({ url: `https://www.youtube.com/watch?v=${vid}`, user_id: userId })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting new video:', insertError);
        return NextResponse.json({ message: 'Error inserting new video' }, { status: 500 });
      }

      videoId = newVideo.id;
    } else {
      videoId = video.id;
    }

    // Check if summary exists in the database
    const { data: existingSummary, error: summaryError } = await supabase
      .from('summaries')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') {
      throw new SummaryFetchError('Error checking existing summary');
    }

    if (existingSummary) {
      return NextResponse.json({ summary: existingSummary });
    }

    // If summary doesn't exist, start the summarization process
    const transcript = await fetchTranscript(vid);
    if (!transcript) {
      throw new TranscriptNotFoundError('No transcript found for this video');
    }

    const summary = await generateSummary(transcript);

    // Save the summary to the database
    const { data: savedSummary, error: saveError } = await supabase
      .from('summaries')
      .insert({ 
        video_id: videoId, 
        user_id: userId,
        content: summary 
      })
      .select()
      .single();

    if (saveError) {
      throw new DatabaseInsertError('Error saving summary to database');
    }

    // Increment the user's transcriptions_used count
    const { error: updateError } = await supabase
      .from('anonymous_users')
      .update({ transcriptions_used: user.transcriptions_used + 1 })
      .eq('id', userId);

    if (updateError) {
      throw new DatabaseUpdateError('Error updating transcriptions_used');
    }

    return NextResponse.json({ summary: savedSummary });
  } catch (error) {
    if (error instanceof CustomError) {
      console.error(`${error.name}: ${error.message}`, error.stack);
      return NextResponse.json({ message: error.message }, { status: 500 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ message: 'Internal server error during video processing' }, { status: 500 });
    }
  }
}

async function fetchTranscript(videoId: string): Promise<string | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

async function generateSummary(transcript: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4-turbo',
        messages: [
          { role: "system", content: "You are a helpful assistant that summarizes YouTube video transcripts." },
          { role: "user", content: `Please summarize the following transcript:\n\n${transcript}` }
        ],
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    console.error('Error generating summary with OpenRouter:', error);
    throw new Error('Failed to generate summary using AI');
  }
}
