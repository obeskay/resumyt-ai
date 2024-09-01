import { NextApiRequest, NextApiResponse } from 'next';
import { getVideoDetails } from '@/lib/videoProcessingNode';

// Cambiar el entorno de ejecución a 'nodejs'
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Se requiere la URL del video' });
    }

    const { title, thumbnail } = await getVideoDetails(videoUrl);

    return res.status(200).json({ title, thumbnail });
  } catch (error) {
    console.error('Error al procesar el video:', error);
    return res.status(500).json({ error: 'No se pudo procesar el video', details: error });
  }
}
