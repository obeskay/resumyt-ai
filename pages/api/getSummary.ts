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
    const { data: summary, error } = await supabase
      .from("summaries")
      .select("content, transcript, video_id, videos(title, thumbnail_url)")
      .eq("video_id", id)
      .single();

    if (error) {
      console.error("Error fetching summary:", error);
      return res.status(500).json({ error: 'Error al obtener el resumen' });
    }

    if (!summary) {
      return res.status(404).json({ error: 'Resumen no encontrado' });
    }

    const response = {
      content: summary.content,
      transcript: summary.transcript,
      videoId: summary.video_id,
      title: summary?.videos?.title || '',
      thumbnailUrl: summary?.videos?.thumbnail_url || '',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}