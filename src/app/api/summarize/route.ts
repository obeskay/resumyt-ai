import { NextRequest, NextResponse } from 'next/server';
import { summarizeVideo } from '@/lib/videoProcessing';

export async function POST(req: NextRequest) {
  try {
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const summary = await summarizeVideo(videoUrl);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarize API route:', error);
    return NextResponse.json({ error: 'Failed to summarize video' }, { status: 500 });
  }
}