import { processYouTubeVideo } from '../../lib/videoProcessing';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing videoUrl in request body' });
  }

  try {
    const result = await processYouTubeVideo(videoUrl);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in processing request:', error.message);
    res.status(500).json({ error: 'Failed to process video', details: error.message });
  }
}
