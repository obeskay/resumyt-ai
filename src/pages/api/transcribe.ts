import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ error: 'Missing audioUrl in request body' });
  }

  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  const data = {
    version: '3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c',
    input: {
      audio: audioUrl,
      batch_size: 64
    }
  };

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Ensure transcription is available only if the status is succeeded
    if (result.status === 'succeeded') {
      const transcription = result.output?.text || 'No transcription available.';
      res.status(200).json({ transcription });
    } else if (result.status === 'failed') {
      throw new Error('Transcription processing failed.');
    } else {
      res.status(202).json({ message: 'Transcription is still in progress. Please check back later.' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to transcribe audio. Please try again.' });
  }
}
