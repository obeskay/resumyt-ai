import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 });

export async function getVideoDetails(videoUrl: string): Promise<{ title: string, thumbnail: string }> {
  const cachedDetails = cache.get<{ title: string, thumbnail: string }>(videoUrl);
  if (cachedDetails) {
    return cachedDetails;
  }

  const videoId = extractVideoId(videoUrl);
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key no está configurada');
  }

  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet',
        id: videoId,
        key: apiKey
      }
    });

    const videoData = response.data.items[0].snippet;
    const details = {
      title: videoData.title,
      thumbnail: videoData.thumbnails.high.url
    };

    cache.set(videoUrl, details);
    return details;
  } catch (error) {
    console.error('Error al obtener detalles del video:', error);
    return {
      title: 'Error al obtener título',
      thumbnail: ''
    };
  }
}

function extractVideoId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}