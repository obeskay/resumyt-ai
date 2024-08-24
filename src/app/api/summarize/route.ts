import { NextRequest, NextResponse } from 'next/server';
import { summarizeVideo } from '@/lib/videoProcessing';
import { VideoFetchError, TranscriptNotFoundError, SummaryGenerationError, DatabaseInsertError, DatabaseUpdateError } from '@/lib/errors';
import { getSupabase } from '@/lib/supabase';
import { SummaryInsert } from '@/types/supabase';
import { rateLimit } from '@/lib/rateLimit';

interface ErrorResponse {
  error: string;
  details?: string;
}

function createErrorResponse(message: string, details?: string, status: number = 500): NextResponse<ErrorResponse> {
  console.error(`Error: ${message}${details ? ` - ${details}` : ''}`);
  return NextResponse.json({ error: message, details }, { status });
}

function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await rateLimit(req);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { videoUrl } = await req.json();
    
    if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
      return createErrorResponse('Invalid YouTube URL', 'Please provide a valid YouTube URL', 400);
    }

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      return createErrorResponse('Invalid YouTube URL', 'Unable to extract video ID from the URL', 400);
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    const supabase = getSupabase();

    // Check user's quota
    const { data: user, error: userError } = await supabase
      .from('anonymous_users')
      .select('id, quota_remaining')
      .eq('ip_address', ipAddress)
      .single();

    if (userError) {
      console.error('Failed to fetch user:', userError);
      return createErrorResponse('Failed to fetch user', userError.message, 500);
    }

    if (user.quota_remaining <= 0) {
      return createErrorResponse('Quota exhausted', 'You have reached your quota limit for video summaries', 403);
    }

    console.log('Attempting to summarize video:', videoUrl);
    const { summary, transcript } = await summarizeVideo(videoUrl);
    console.log('Summary generated successfully, length:', summary.length);

    if (!summary) {
      console.error('Generated summary is null or empty');
      throw new SummaryGenerationError("Failed to generate summary: Summary is null or empty");
    }

    // Update the user's quota
    const { error: updateError } = await supabase
      .from('anonymous_users')
      .update({ quota_remaining: user.quota_remaining - 1 })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user quota:', updateError);
      throw new DatabaseUpdateError('Failed to update user quota');
    }

    // Insert or update the video in the database
    const { data: insertedVideo, error: videoUpsertError } = await supabase
      .from('videos')
      .upsert({ id: videoId, url: videoUrl, user_id: user.id })
      .select()
      .single();

    if (videoUpsertError) {
      console.error('Failed to save video:', videoUpsertError);
      console.error('Error details:', JSON.stringify(videoUpsertError, null, 2));
      throw new DatabaseInsertError(`Failed to save video: ${videoUpsertError.message}`);
    }

    // Insert the summary into the database
    const summaryInsert: SummaryInsert = {
      video_id: videoId,
      content: summary,
      transcript: transcript || '',
      user_id: user.id
    };

    console.log('Attempting to insert summary:', JSON.stringify(summaryInsert, null, 2));

    const { data: insertedSummary, error: insertError } = await supabase
      .from('summaries')
      .upsert(summaryInsert)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save summary:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      throw new DatabaseInsertError(`Failed to save summary: ${insertError.message}`);
    }

    if (!insertedSummary) {
      console.error('No summary data returned after insertion');
      throw new DatabaseInsertError('Failed to save summary: No data returned');
    }

    console.log('Summary inserted successfully:', insertedSummary);

    return NextResponse.json({
      summary,
      transcript,
      videoId,
      quotaRemaining: user.quota_remaining - 1
    });
  } catch (error) {
    console.error('Error in summarize API:', error);

    if (error instanceof VideoFetchError) {
      return createErrorResponse('Failed to fetch video', error.message, 400);
    } else if (error instanceof TranscriptNotFoundError) {
      return createErrorResponse('Failed to transcribe video', error.message, 400);
    } else if (error instanceof SummaryGenerationError) {
      return createErrorResponse('Failed to generate summary', error.message, 500);
    } else if (error instanceof DatabaseInsertError) {
      return createErrorResponse('Failed to save data', error.message, 500);
    } else if (error instanceof DatabaseUpdateError) {
      return createErrorResponse('Failed to update data', error.message, 500);
    } else if (error instanceof Error) {
      return createErrorResponse('An unexpected error occurred', error.message);
    }

    return createErrorResponse('An unknown error occurred');
  }
}