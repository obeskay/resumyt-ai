import { NextRequest, NextResponse } from 'next/server';
import { summarizeVideo } from '@/lib/videoProcessing';
import { VideoFetchError, TranscriptNotFoundError, SummaryGenerationError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    console.log('Attempting to summarize video:', videoUrl);
    const summary = await summarizeVideo(videoUrl);
    console.log('Summary generated successfully');
    return NextResponse.json({ summary });
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