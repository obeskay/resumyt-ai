import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de video no válido' });
  }

  const supabase = getSupabase();

  try {
    const { data: summaries, error } = await supabase
      .from("summaries")
      .select(`
        content, 
        transcript, 
        video_id, 
        title,
        format,
        videos (thumbnail_url)
      `)
      .eq("video_id", id);

    if (error) {
      console.error("Error fetching summaries:", error);
      return res.status(500).json({ error: 'Error al obtener los resúmenes' });
    }

    if (!summaries || summaries.length === 0) {
      return res.status(404).json({ error: 'Resúmenes no encontrados' });
    }

    const response = summaries.map((summary) => ({
      content: summary.content,
      transcript: summary.transcript,
      videoId: summary.video_id,
      title: summary.title,
      thumbnailUrl: summary?.videos?.[0]?.thumbnail_url || '',
      format: summary.format,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}