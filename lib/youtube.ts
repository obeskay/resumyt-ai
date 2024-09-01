import axios from 'axios';

export async function getVideoInfo(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API key no está configurada');
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('No se encontró información del video');
    }

    const videoData = response.data.items[0].snippet;
    return {
      title: videoData.title,
      description: videoData.description,
      thumbnailUrl: videoData.thumbnails.default.url,
    };
  } catch (error) {
    console.error('Error al obtener información del video:', error);
    throw new Error('No se pudo obtener la información del video');
  }
}