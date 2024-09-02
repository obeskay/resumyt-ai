import axios from 'axios';

export async function getVideoDetails(videoUrl: string) {
  const videoId = extractVideoId(videoUrl);
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const videoData = response.data.items[0].snippet;

    return {
      title: videoData.title,
      thumbnail: videoData.thumbnails.high.url,
    };
  } catch (error) {
    console.error('Error al obtener detalles del video:', error);
    throw error;
  }
}

function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
}