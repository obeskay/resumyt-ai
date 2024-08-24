import { NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const videoInfo = await ytdl.getInfo(videoUrl);
    const videoDetails = videoInfo.videoDetails;

    const title = videoDetails.title;
    const thumbnail = videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url;

    return NextResponse.json({ title, thumbnail });
  } catch (error) {
    console.error('Error processing video:', error);
    return NextResponse.json({ error: 'Failed to process video' }, { status: 500 });
  }
}
