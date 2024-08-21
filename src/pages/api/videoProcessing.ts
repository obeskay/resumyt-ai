import { processYouTubeVideo } from '../../lib/videoProcessing';
import { NextApiRequest, NextApiResponse } from 'next';

interface VideoProcessingRequestBody {
  videoUrl: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Received request body:', req.body);

  let videoUrl: string | undefined;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const requestBody = body as VideoProcessingRequestBody;
    videoUrl = requestBody.videoUrl;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return res.status(400).json({ error: 'Invalid request body' });
  }

  console.log('Extracted videoUrl:', videoUrl);

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing videoUrl in request body' });
  }

  if (typeof videoUrl !== 'string' || !videoUrl.trim()) {
    return res.status(400).json({ error: 'Invalid videoUrl: must be a non-empty string' });
  }

  console.log('Processing video:', videoUrl);
  res.status(202).json({ message: 'Processing video...' });
  try {
    const result = await processYouTubeVideo(videoUrl);
    console.log('Processing result:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in processing request:', error);
    res.status(500).json({ error: 'Failed to process video', details: error.message || 'An unexpected error occurred' });
  }
}
