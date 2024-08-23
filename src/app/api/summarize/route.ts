import { NextRequest, NextResponse } from 'next/server';
import { summarizeVideo } from '@/lib/videoProcessing';
import { VideoFetchError, TranscriptNotFoundError, SummaryGenerationError } from '@/lib/errors';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  let userQuotaRemaining = parseInt(cookieStore.get('userQuotaRemaining')?.value || '3');

  try {
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    if (userQuotaRemaining <= 0) {
      return NextResponse.json({ error: 'You have reached your daily limit for video summaries' }, { status: 403 });
    }

    console.log('Attempting to summarize video:', videoUrl);
    const summary = await summarizeVideo(videoUrl);
    console.log('Summary generated successfully');

    userQuotaRemaining--;
    cookieStore.set('userQuotaRemaining', userQuotaRemaining.toString(), { maxAge: 86400 }); // 24 hours

    return NextResponse.json({ summary, userQuotaRemaining });
  } catch (error) {
    console.error('Error in summarize API route:', error);

    if (error instanceof VideoFetchError) {
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: 400 });
    } else if (error instanceof TranscriptNotFoundError) {
      return NextResponse.json({ error: 'Failed to transcribe video' }, { status: 400 });
    } else if (error instanceof SummaryGenerationError) {
      return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    } else if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
