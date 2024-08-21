import { processYouTubeVideo } from '../../lib/videoProcessing';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Received request body:', req.body);

  let videoUrl;
  if (typeof req.body === 'string') {
    try {
      const parsedBody = JSON.parse(req.body);
      videoUrl = parsedBody.videoUrl;
    } catch (error) {
      console.error('Error parsing request body:', error);
    }
  } else {
    videoUrl = req.body.videoUrl;
  }

  console.log('Extracted videoUrl:', videoUrl);

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing videoUrl in request body' });
  }

  if (typeof videoUrl !== 'string') {
    return res.status(400).json({ error: 'Invalid videoUrl: must be a string' });
  }

  if (!videoUrl.trim()) {
    return res.status(400).json({ error: 'Invalid videoUrl: cannot be empty' });
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
